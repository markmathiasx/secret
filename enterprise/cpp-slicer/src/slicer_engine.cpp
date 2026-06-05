#include "slicer_engine.h"

#include <algorithm>
#include <cmath>
#include <iostream>
#include <stdexcept>

namespace mdh3d {

ThreadPool::ThreadPool(std::size_t workers) {
  const std::size_t workerCount = std::max<std::size_t>(1, workers);
  workers_.reserve(workerCount);
  for (std::size_t index = 0; index < workerCount; ++index) {
    workers_.emplace_back([this]() {
      while (true) {
        std::function<void()> task;
        {
          std::unique_lock<std::mutex> lock(mutex_);
          condition_.wait(lock, [this]() { return stopping_ || !tasks_.empty(); });
          if (stopping_ && tasks_.empty()) return;
          task = std::move(tasks_.front());
          tasks_.pop();
        }
        task();
      }
    });
  }
}

ThreadPool::~ThreadPool() {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    stopping_ = true;
  }
  condition_.notify_all();
  for (auto& worker : workers_) {
    if (worker.joinable()) worker.join();
  }
}

void ThreadPool::submit(std::function<void()> task) {
  {
    std::lock_guard<std::mutex> lock(mutex_);
    if (stopping_) throw std::runtime_error("thread pool stopped");
    tasks_.push(std::move(task));
  }
  condition_.notify_one();
}

void ThreadPool::drain() {
  while (true) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (tasks_.empty()) return;
  }
}

SlicerEngine::SlicerEngine(PrintConfig config) : config_(config) {}

SliceResult SlicerEngine::estimateBox(double widthMm, double depthMm, double heightMm) const {
  if (widthMm <= 0 || depthMm <= 0 || heightMm <= 0 || config_.layerHeightMm <= 0) {
    return {0, 0, 0, "invalid_dimensions"};
  }

  const int layers = static_cast<int>(std::ceil(heightMm / config_.layerHeightMm));
  const double perimeterMeters = ((widthMm + depthMm) * 2.0 * config_.perimeterCount * layers) / 1000.0;
  const double infillMeters = (widthMm * depthMm * heightMm * (config_.infillPercent / 100.0)) / 4200.0;
  const double filamentMeters = perimeterMeters + infillMeters;
  const double minutes = layers * 0.38 + filamentMeters * 1.9;

  return {minutes, filamentMeters, layers, "estimated"};
}

void SlicerEngine::logResult(const SliceResult& result) const {
  std::cout << "{\"module\":\"cpp-slicer\",\"status\":\"" << result.status
            << "\",\"layers\":" << result.layerCount
            << ",\"minutes\":" << result.estimatedMinutes
            << ",\"filament_m\":" << result.estimatedFilamentMeters << "}" << std::endl;
}

}  // namespace mdh3d

extern "C" double mdh3d_estimate_minutes(double width_mm, double depth_mm, double height_mm, double layer_height_mm) {
  mdh3d::PrintConfig config;
  config.layerHeightMm = layer_height_mm;
  mdh3d::SlicerEngine engine(config);
  return engine.estimateBox(width_mm, depth_mm, height_mm).estimatedMinutes;
}

#pragma once

#include <condition_variable>
#include <cstddef>
#include <functional>
#include <mutex>
#include <optional>
#include <queue>
#include <string>
#include <thread>
#include <vector>

namespace mdh3d {

struct PrintConfig {
  double layerHeightMm = 0.2;
  double nozzleDiameterMm = 0.4;
  double infillPercent = 15.0;
  double filamentDiameterMm = 1.75;
  int perimeterCount = 2;
};

struct SliceResult {
  double estimatedMinutes = 0;
  double estimatedFilamentMeters = 0;
  int layerCount = 0;
  std::string status = "queued";
};

template <typename T>
class ConcurrentQueue {
 public:
  void push(T value) {
    {
      std::lock_guard<std::mutex> lock(mutex_);
      queue_.push(std::move(value));
    }
    condition_.notify_one();
  }

  std::optional<T> tryPop() {
    std::lock_guard<std::mutex> lock(mutex_);
    if (queue_.empty()) return std::nullopt;
    T value = std::move(queue_.front());
    queue_.pop();
    return value;
  }

  bool empty() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return queue_.empty();
  }

 private:
  mutable std::mutex mutex_;
  std::condition_variable condition_;
  std::queue<T> queue_;
};

class ThreadPool {
 public:
  explicit ThreadPool(std::size_t workers = std::thread::hardware_concurrency());
  ~ThreadPool();

  void submit(std::function<void()> task);
  void drain();

 private:
  std::mutex mutex_;
  std::condition_variable condition_;
  std::queue<std::function<void()>> tasks_;
  std::vector<std::thread> workers_;
  bool stopping_ = false;
};

class SlicerEngine {
 public:
  explicit SlicerEngine(PrintConfig config = {});
  SliceResult estimateBox(double widthMm, double depthMm, double heightMm) const;
  void logResult(const SliceResult& result) const;

 private:
  PrintConfig config_;
};

}  // namespace mdh3d

extern "C" {
double mdh3d_estimate_minutes(double width_mm, double depth_mm, double height_mm, double layer_height_mm);
}

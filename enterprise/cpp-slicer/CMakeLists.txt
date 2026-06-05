cmake_minimum_required(VERSION 3.20)
project(mdh3d_cpp_slicer LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(mdh3d_slicer STATIC src/slicer_engine.cpp)
target_include_directories(mdh3d_slicer PUBLIC include)

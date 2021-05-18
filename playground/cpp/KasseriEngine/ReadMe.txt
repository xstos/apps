
Installing FreeType:

VCPKG https://devblogs.microsoft.com/cppblog/vcpkg-a-tool-to-acquire-and-build-c-open-source-libraries-on-windows/

set env var 
VCPKG_DEFAULT_TRIPLET=x64-windows

Alternatively, you can build and install freetype-gl using vcpkg dependency manager:

git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh
./vcpkg integrate install

./vcpkg install freetype-gl
./vcpkg install glfw3
./vcpkg install glm
./vcpkg install glew
./vcpkg install glad
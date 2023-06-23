#include <windows.h>

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
        const char CLASS_NAME[] = "Sample Window Class";
        const char WINDOW_TITLE[] = "Circle Window";

        WNDCLASS wc = { 0 };
        wc.lpfnWndProc = WindowProc;
        wc.hInstance = hInstance;
        wc.lpszClassName = CLASS_NAME;

        RegisterClass(&wc);

        HWND hwnd = CreateWindowEx(
                        0,
                        CLASS_NAME,
                        WINDOW_TITLE,
                        WS_OVERLAPPEDWINDOW,
                        CW_USEDEFAULT,
                        CW_USEDEFAULT,
                        400,
                        400,
                        NULL,
                        NULL,
                        hInstance,
                        NULL);

        if (hwnd == NULL) {
                return 0;
        }

        ShowWindow(hwnd, nCmdShow);

        MSG msg;
        while (GetMessage(&msg, NULL, 0, 0)) {
                TranslateMessage(&msg);
                DispatchMessage(&msg);
        }

        return msg.wParam;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
        switch (uMsg) {
        case WM_DESTROY:
                PostQuitMessage(0);
                return 0;
        case WM_PAINT: {
                PAINTSTRUCT ps;
                HDC hdc = BeginPaint(hwnd, &ps);

                // Set the circle color
                HBRUSH hBrush = CreateSolidBrush(RGB(255, 0, 0));

                // Draw the circle
                Ellipse(hdc, 50, 50, 350, 350);

                // Clean up
                DeleteObject(hBrush);
                EndPaint(hwnd, &ps);
        }
                return 0;
        }

        return DefWindowProc(hwnd, uMsg, wParam, lParam);
}
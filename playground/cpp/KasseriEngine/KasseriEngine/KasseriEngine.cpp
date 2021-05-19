//from https://github.com/CAMOBAP/opengl-modern-tutorials/blob/master/text02_atlas/text.cpp

#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <algorithm>

#include <GL/glew.h>
#include <GL/freeglut.h>
#include <GLFW/glfw3.h>
#define GLM_FORCE_RADIANS
#include <filesystem>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <ft2build.h>
#include FT_FREETYPE_H

#include "shader_utils.h"

using namespace std;

GLuint program;
GLint attribute_coord;
GLint uniform_tex;
GLint uniform_color;
GLFWwindow* window;
double mouseX;
double mouseY;
struct point {
	GLfloat x;
	GLfloat y;
	GLfloat s;
	GLfloat t;
};

GLuint vbo;

FT_Library ft;
FT_Face face;

// Maximum texture width
#define MAXWIDTH 1024

const char* fontfilename;

/**
 * The atlas struct holds a texture that contains the visible US-ASCII characters
 * of a certain font rendered with a certain character height.
 * It also contains an array that contains all the information necessary to
 * generate the appropriate vertex and texture coordinates for each character.
 *
 * After the constructor is run, you don't need to use any FreeType functions anymore.
 */
struct atlas {
	GLuint tex;		// texture object

	int w;			// width of texture in pixels
	int h;			// height of texture in pixels

	struct {
		float ax;	// advance.x
		float ay;	// advance.y

		float bw;	// bitmap.width;
		float bh;	// bitmap.height;

		float bl;	// bitmap_left;
		float bt;	// bitmap_top;

		float tx;	// x offset of glyph in texture coordinates
		float ty;	// y offset of glyph in texture coordinates
	} c[128];		// character information

	atlas(FT_Face face, int height) {
		FT_Set_Pixel_Sizes(face, 0, height);
		FT_GlyphSlot g = face->glyph;

		int roww = 0;
		int rowh = 0;
		w = 0;
		h = 0;

		memset(c, 0, sizeof c);

		/* Find minimum size for a texture holding all visible ASCII characters */
		for (int i = 32; i < 128; i++) {
			if (FT_Load_Char(face, i, FT_LOAD_RENDER)) {
				fprintf(stderr, "Loading character %c failed!\n", i);
				continue;
			}
			if (roww + g->bitmap.width + 1 >= MAXWIDTH) {
				w = std::max(w, roww);
				h += rowh;
				roww = 0;
				rowh = 0;
			}
			roww += g->bitmap.width + 1;
			rowh = std::max((unsigned int)rowh, g->bitmap.rows);
		}

		w = std::max(w, roww);
		h += rowh;

		/* Create a texture that will be used to hold all ASCII glyphs */
		glActiveTexture(GL_TEXTURE0);
		glGenTextures(1, &tex);
		glBindTexture(GL_TEXTURE_2D, tex);
		glUniform1i(uniform_tex, 0);

		glTexImage2D(GL_TEXTURE_2D, 0, GL_ALPHA, w, h, 0, GL_ALPHA, GL_UNSIGNED_BYTE, 0);

		/* We require 1 byte alignment when uploading texture data */
		glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

		/* Clamping to edges is important to prevent artifacts when scaling */
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

		/* Linear filtering usually looks best for text */
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

		/* Paste all glyph bitmaps into the texture, remembering the offset */
		int ox = 0;
		int oy = 0;

		rowh = 0;

		for (int i = 32; i < 128; i++) {
			if (FT_Load_Char(face, i, FT_LOAD_RENDER)) {
				fprintf(stderr, "Loading character %c failed!\n", i);
				continue;
			}

			if (ox + g->bitmap.width + 1 >= MAXWIDTH) {
				oy += rowh;
				rowh = 0;
				ox = 0;
			}

			glTexSubImage2D(GL_TEXTURE_2D, 0, ox, oy, g->bitmap.width, g->bitmap.rows, GL_ALPHA, GL_UNSIGNED_BYTE, g->bitmap.buffer);
			c[i].ax = g->advance.x >> 6;
			c[i].ay = g->advance.y >> 6;

			c[i].bw = g->bitmap.width;
			c[i].bh = g->bitmap.rows;

			c[i].bl = g->bitmap_left;
			c[i].bt = g->bitmap_top;

			c[i].tx = ox / (float)w;
			c[i].ty = oy / (float)h;

			rowh = std::max((unsigned int)rowh, g->bitmap.rows);
			ox += g->bitmap.width + 1;
		}

		fprintf(stderr, "Generated a %d x %d (%d kb) texture atlas\n", w, h, w * h / 1024);
	}

	~atlas() {
		glDeleteTextures(1, &tex);
	}
};

atlas* a48;
atlas* a24;
atlas* a12;

int init_resources() {
	/* Initialize the FreeType2 library */
	if (FT_Init_FreeType(&ft)) {
		fprintf(stderr, "Could not init freetype library\n");
		return 0;
	}

	/* Load a font */
	if (FT_New_Face(ft, fontfilename, 0, &face)) {
		fprintf(stderr, "Could not open font %s\n", fontfilename);
		return 0;
	}

	program = create_program("text.v.glsl", "text.f.glsl");
	if (program == 0)
		return 0;

	attribute_coord = get_attrib(program, "coord");
	uniform_tex = get_uniform(program, "tex");
	uniform_color = get_uniform(program, "color");

	if (attribute_coord == -1 || uniform_tex == -1 || uniform_color == -1)
		return 0;

	// Create the vertex buffer object
	glGenBuffers(1, &vbo);

	/* Create texture atlasses for several font sizes */
	a48 = new atlas(face, 48);
	a24 = new atlas(face, 24);
	a12 = new atlas(face, 12);

	return 1;
}

/**
 * Render text using the currently loaded font and currently set font size.
 * Rendering starts at coordinates (x, y), z is always 0.
 * The pixel coordinates that the FreeType2 library uses are scaled by (sx, sy).
 */
void render_text(const char* text, atlas* a, float x, float y, float sx, float sy) {
	const uint8_t* p;

	/* Use the texture containing the atlas */
	glBindTexture(GL_TEXTURE_2D, a->tex);
	glUniform1i(uniform_tex, 0);

	/* Set up the VBO for our vertex data */
	glEnableVertexAttribArray(attribute_coord);
	glBindBuffer(GL_ARRAY_BUFFER, vbo);
	glVertexAttribPointer(attribute_coord, 4, GL_FLOAT, GL_FALSE, 0, 0);

	point coords[6 * 256];
	int c = 0;

	/* Loop through all characters */
	for (p = (const uint8_t*)text; *p; p++) {
		/* Calculate the vertex and texture coordinates */
		float x2 = x + a->c[*p].bl * sx;
		float y2 = -y - a->c[*p].bt * sy;
		float w = a->c[*p].bw * sx;
		float h = a->c[*p].bh * sy;

		/* Advance the cursor to the start of the next character */
		x += a->c[*p].ax * sx;
		y += a->c[*p].ay * sy;

		/* Skip glyphs that have no pixels */
		if (!w || !h)
			continue;

		coords[c++] = {		x2, -y2, a->c[*p].tx, a->c[*p].ty };
		coords[c++] = {		x2 + w, -y2, a->c[*p].tx + a->c[*p].bw / a->w, a->c[*p].ty };
		coords[c++] = {		x2, -y2 - h, a->c[*p].tx, a->c[*p].ty + a->c[*p].bh / a->h };
		coords[c++] = {		x2 + w, -y2, a->c[*p].tx + a->c[*p].bw / a->w, a->c[*p].ty };
		coords[c++] = {		x2, -y2 - h, a->c[*p].tx, a->c[*p].ty + a->c[*p].bh / a->h };
		coords[c++] = {		x2 + w, -y2 - h, a->c[*p].tx + a->c[*p].bw / a->w, a->c[*p].ty + a->c[*p].bh / a->h };
	}

	/* Draw all the character on the screen in one go */
	glBufferData(GL_ARRAY_BUFFER, sizeof coords, coords, GL_DYNAMIC_DRAW);
	glDrawArrays(GL_TRIANGLES, 0, c);

	glDisableVertexAttribArray(attribute_coord);
}
void paintPixels()
{
	
	
	const int nx = 100;
	const int ny = 100;

	// One time during setup.
	unsigned int data[ny][nx][3];
	for (size_t y = 0; y < ny; ++y)
	{
		for (size_t x = 0; x < nx; ++x)
		{
			data[y][x][0] = (rand() % 256) * 256 * 256 * 256;
			data[y][x][1] = 0;
			data[y][x][2] = 0;
		}
	}
	
	glDrawPixels(nx, ny, GL_RGB, GL_UNSIGNED_INT, data);
}

void display() {
	float sx = 2.0 / 640;
	float sy = 2.0 / 480;
	
	glUseProgram(program);

	/* White background */
	glClearColor(1, 1, 1, 1);
	glClear(GL_COLOR_BUFFER_BIT);

	//paintPixels();
	
	/* Enable blending, necessary for our alpha texture */
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

	GLfloat black[4] = { 0, 0, 0, 1 };
	GLfloat red[4] = { 1, 0, 0, 1 };
	GLfloat transparent_green[4] = { 0, 1, 0, 0.5 };
	
	
	if (true) {
		/* Set color to black */
		glUniform4fv(uniform_color, 1, black);

		/* Effects of alignment */
		render_text(std::to_string(mouseX).data(), a48, -1 + 8 * sx, 1 - 50 * sy, sx, sy);
		render_text(std::to_string(mouseY).data(), a48, -1 + 8.5 * sx, 1 - 100.5 * sy, sx, sy);

		/* Scaling the texture versus changing the font size */
		render_text("The Small Texture Scaled Fox Jumps Over The Lazy Dog", a48, -1 + 8 * sx, 1 - 175 * sy, sx * 0.5, sy * 0.5);
		render_text("The Small Font Sized Fox Jumps Over The Lazy Dog", a24, -1 + 8 * sx, 1 - 200 * sy, sx, sy);
		render_text("The Tiny Texture Scaled Fox Jumps Over The Lazy Dog", a48, -1 + 8 * sx, 1 - 235 * sy, sx * 0.25, sy * 0.25);
		render_text("The Tiny Font Sized Fox Jumps Over The Lazy Dog", a12, -1 + 8 * sx, 1 - 250 * sy, sx, sy);

		/* Colors and transparency */
		render_text("The Solid Black Fox Jumps Over The Lazy Dog", a48, -1 + 8 * sx, 1 - 430 * sy, sx, sy);

		glUniform4fv(uniform_color, 1, red);
		render_text("The Solid Red Fox Jumps Over The Lazy Dog", a48, -1 + 8 * sx, 1 - 330 * sy, sx, sy);
		render_text("The Solid Red Fox Jumps Over The Lazy Dog", a48, -1 + 28 * sx, 1 - 450 * sy, sx, sy);

		glUniform4fv(uniform_color, 1, transparent_green);
		render_text("The Transparent Green Fox Jumps Over The Lazy Dog", a48, -1 + 8 * sx, 1 - 380 * sy, sx, sy);
		render_text("The Transparent Green Fox Jumps Over The Lazy Dog", a48, -1 + 18 * sx, 1 - 440 * sy, sx, sy);
	}
	
	
	
	glfwSwapBuffers(window);
	//glutSwapBuffers();
}

void free_resources() {
	glDeleteProgram(program);
}

static void cursor_position_callback(GLFWwindow* window, double xpos, double ypos)
{
	mouseX = xpos;
	mouseY = ypos;
}
static void mouse_callback(GLFWwindow* window, int button, int action, int mods)
{

	glfwGetCursorPos(window, &mouseX, &mouseY);
	if (button == GLFW_MOUSE_BUTTON_LEFT) {
		

		
	}
}

int main(int argc, char* argv[]) {
	

	const filesystem::path exePath = argv[0];

	auto fontPath = exePath.parent_path().append("consola.ttf").string();


	if (argc > 1)
		fontfilename = argv[1];
	else
		fontfilename = fontPath.data();
	

	/* Initialize the library */
	if (!glfwInit())
		return -1;

	/* Create a windowed mode window and its OpenGL context */
	window = glfwCreateWindow(640, 480, "Hello World", NULL, NULL);
	if (!window)
	{
		glfwTerminate();
		return -1;
	}
	
	glfwMakeContextCurrent(window);

	glfwSetMouseButtonCallback(window, mouse_callback);
	glfwSetCursorPosCallback(window, cursor_position_callback);
	GLenum glew_status = glewInit();

	if (GLEW_OK != glew_status) {
		fprintf(stderr, "Error: %s\n", glewGetErrorString(glew_status));
		return 1;
	}

	int width, height;
	glfwGetFramebufferSize(window, &width, &height);
	glViewport(0, 0, width, height);
	
	if (!init_resources())
	{
		free_resources();
		return -1;
	}
	
	while (!glfwWindowShouldClose(window))
	{
		display();
		glfwPollEvents();
	}

	glfwTerminate();
	
	return 0;
	
	glutInit(&argc, argv);
	glutInitContextVersion(2, 0);
	glutInitDisplayMode(GLUT_RGB);
	glutInitWindowSize(640, 480);
	glutCreateWindow("Texture atlas text");
	
	
	

	

	// if (!GLEW_VERSION_2_0) {
	// 	fprintf(stderr, "No support for OpenGL 2.0 found\n");
	// 	return 1;
	// }

	if (init_resources()) {
		glutDisplayFunc(display);
		glutMainLoop();
	}

	free_resources();
	return 0;
}
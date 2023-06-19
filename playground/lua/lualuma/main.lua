lovector = require "lovector"
io.stdout:setvbuf('no') 
isKeyDown=love.keyboard.isDown
tbl={}
keyWasPressedSinceLastUpdate=false

local house=nil
local white = lovector.paint.Color(1,1,1,1)
function lovectorDemo()
  local roof_path = lovector.PathBuilder()
  :move_to(50, 140)
  :line_to(150, 60)
  :line_to(250, 140)
  :close_path()
  house = lovector.Graphics()
  -- Set line width
  :set_line_width(10)

  -- Wall
  :rect(75, 140, 150, 110)
  :set_stroke_paint(white)
  :stroke_path()

  -- Door
  :begin_path()
  :rect(130, 190, 40, 60)
  :set_fill_paint(white)
  :fill_path()

  -- You can also use a manually created Path!
  :stroke_path(roof_path)

end
function love.load(arg)
  if arg[#arg] == "-debug" then 
    require("mobdebug").start() 
    print("debug mode enabled")
  end
  for i=0,100000,1 do 
    tbl[i]=i
  end

  a = 1
  local f = load "print(a)"
  f()

end
scale = 0
function love.draw()
--love.graphics.print("Hello World!", 400, 300)
  --https://www.reddit.com/r/love2d/comments/gldnv1/noob_best_way_of_setting_print_font_color/
  love.graphics.setBackgroundColor(0,0,0,1)
  scale=scale+0.001
  --house:draw(100, 100,scale)

end

function love.keypressed(key, scancode, isrepeat)
  keyWasPressedSinceLastUpdate = true
  if key == "escape" then
    love.event.quit()

  end

end

function love.update()
  if keyWasPressedSinceLastUpdate then
    keyWasPressedSinceLastUpdate=false
    if isKeyDown('lctrl') and isKeyDown('v') then
      print("paste")

    end
  end

end
--https://stackoverflow.com/a/5483878 http download
--https://stackoverflow.com/a/17987723 sleep
--https://hump.readthedocs.io/en/latest/timer.html https://github.com/vrld/hump

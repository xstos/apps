io.stdout:setvbuf('no') 
isKeyDown=love.keyboard.isDown
tbl={}
keyWasPressedSinceLastUpdate=false
function love.load(arg)
  if arg[#arg] == "-debug" then require("mobdebug").start() end
  for i=0,1000,1 do 
    tbl[i]=i
  end
  a = 1
  local f = load "print(a)"
  f()
  
end
function love.draw()
--love.graphics.print("Hello World!", 400, 300)

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
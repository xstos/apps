import sys #https://gist.githubusercontent.com/vdiallonort/cfc2e423883626561ea1f1e6dd0a34db/raw/4f237009d23e4c6e143d859d732bc01cda193ef9/heartbeat.py
import time
from machine import Pin
import time


#from threading import Thread ImportError: no module named 'threading'
from _thread import Thread


#python -m pip install max30105
from max30105 import MAX30105, HeartRate

print("""
NOTE! This code should not be used for medical diagnosis. It's
for fun/novelty use only, so bear that in mind while using it.
This Pimoroni Breakout Garden example requires a
MAX30105 Breakout and a 1.12" OLED Breakout (SPI).
The Pulse-O-Matic 6000 is a heartbeat plotter and BPM display.
Press Ctrl+C a couple times to exit.
""")

pin = Pin(25, Pin.OUT)

# Set up MAX30105 Breakout
max30105 = MAX30105()
max30105.setup(leds_enable=2)

max30105.set_led_pulse_amplitude(1, 0.2)
max30105.set_led_pulse_amplitude(2, 12.5)
max30105.set_led_pulse_amplitude(3, 0)

max30105.set_slot_mode(1, 'red')
max30105.set_slot_mode(2, 'ir')
max30105.set_slot_mode(3, 'off')
max30105.set_slot_mode(4, 'off')

hr = HeartRate(max30105)
data = []
running = True

bpm = 0
bpm_avg = 0
beat_detected = False
beat_status = False


def sample():
    """Function to thread heartbeat values separately to
 OLED drawing"""
    global bpm, bpm_avg, beat_detected, beat_status

    average_over = 5
    bpm_vals = [0 for x in range(average_over)]
    last_beat = time.time()

    while running:
        pin.toggle()
        t = time.time()
        samples = max30105.get_samples()
        if samples is not None:
            for i in range(0, len(samples), 2):
                ir = samples[i + 1]
                beat_detected = hr.check_for_beat(ir)
                if beat_detected:
                    beat_status = True
                    delta = t - last_beat
                    last_beat = t
                    bpm = 60 / delta
                    #bpm_vals = bpm_vals[1:] + [bpm] Creating issue
                    bpm_vals.append(int(bpm))
                    bpm_avg = sum(bpm_vals) / average_over
                d = hr.low_pass_fir(ir & 0xff)
                data.append(d)
                if len(data) > 128:
                    data.pop(0)

        time.sleep(1000)


# The thread to measure acclerometer values
t = Thread(target=sample)
t.start()

# The main loop that draws values to the OLED
while True:
    try:
       
        # Draw the heartbeat trace
        vals = data
        new_vals = [x / float((max(vals) - min(vals))) * 32 for x in vals]

        for i in range(1, len(new_vals)):
           print(new_vals[i])

        
    except KeyboardInterrupt:
        running = False
        sys.exit(0)
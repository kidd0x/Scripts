import turtle
import random

def random_color():
    return (random.random(), random.random(), random.random())

def draw_circle(t, x, y, radius, color):
    t.penup()
    t.goto(x, y - radius)
    t.pendown()
    t.fillcolor(color)
    t.begin_fill()
    t.circle(radius)
    t.end_fill()

def draw_rectangle(t, x, y, width, height, color):
    t.penup()
    t.goto(x, y)
    t.pendown()
    t.fillcolor(color)
    t.begin_fill()
    for _ in range(2):
        t.forward(width)
        t.left(90)
        t.forward(height)
        t.left(90)
    t.end_fill()

def draw_realistic_penis():
    screen = turtle.Screen()
    screen.bgcolor("white")
    t = turtle.Turtle()
    t.speed(0)
    t.hideturtle()

    skin_color = random_color()

    ball_radius = random.randint(30, 50)
    shaft_length = random.randint(150, 300)
    shaft_width = ball_radius * 0.8

    draw_circle(t, -ball_radius, -ball_radius, ball_radius, skin_color)
    draw_circle(t, ball_radius, -ball_radius, ball_radius, skin_color)

    draw_rectangle(t, -shaft_width / 2, 0, shaft_width, shaft_length, skin_color)

    turtle.done()

if __name__ == "__main__":
    draw_realistic_penis()

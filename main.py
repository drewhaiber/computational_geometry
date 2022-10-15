# This is a sample Python script.
import sys
import numpy as np
import matplotlib.pyplot as plt
import math
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def cmult(self, c):
        p = Point(self.x * c, self.y * c)
        return p

    def __sub__(self, other):
        return self + (other.cmult(-1))

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def __str__(self):
        return "(" + str(self.x) + ", " + str(self.y) + ")"

    def mag(self):
        return math.sqrt((self.x ** 2) + (self.y ** 2))

    def cross_mag(self, other):
        return abs((self.x * other.y) - (self.y * other.x))

    def dot(self, other):
        return (self.x * other.x) + (self.y * other.y)

    def pair(self):
        return (self.x, self.y)

class Triangle:

    def __init__(self, p1, p2, p3):
        self.p1 = p1
        self.p2 = p2
        self.p3 = p3

    def plot_triangle(self):
        plt.plot((self.p1.x, self.p2.x), (self.p1.y, self.p2.y))
        plt.plot((self.p2.x, self.p3.x), (self.p2.y, self.p3.y))
        plt.plot((self.p1.x, self.p3.x), (self.p1.y, self.p3.y))

    def get_edges(self):
        return ((self.p1, self.p2), (self.p2, self.p3), (self.p3, self.p1))

    def get_circumradius(self):
        num = (self.p1 - self.p2).mag() * (self.p2 - self.p3).mag() * (self.p3 - self.p1).mag()
        denom = 2 * ((self.p1 - self.p2).cross_mag(self.p2 - self.p3))
        return num/denom

    def get_circumcenter(self):

        denom = (2 * (((self.p1 - self.p2).cross_mag(self.p2 - self.p3))**2))
        alpha = (((self.p2 - self.p3).mag() ** 2) * (self.p1 - self.p3).dot(self.p1 - self.p2)) / denom
        beta = (((self.p1 - self.p3).mag() ** 2) * (self.p2 - self.p3).dot(self.p2 - self.p1)) / denom
        gamma = (((self.p1 - self.p2).mag() ** 2) * (self.p3 - self.p1).dot(self.p3 - self.p2)) / denom
        return self.p1.cmult(alpha) + self.p2.cmult(beta) + self.p3.cmult(gamma)

    def in_circumscribe(self, point):
        if
        return True

    def __str__(self):
        return str(self.p1) + ", " + str(self.p2) + ", " + str(self.p3)

#Triangle is (point1, point2, point3) tuple
#Point is (x, y) tuple
def plot_triangle(t):
    p1 = t[0]
    p2 = t[1]
    p3 = t[2]
    plt.plot((p1[0], p2[0]), (p1[1], p2[1]))
    plt.plot((p2[0], p3[0]), (p2[1], p3[1]))
    plt.plot((p1[0], p3[0]), (p1[1], p3[1]))

num_points = 0
points_list = list()

triangulation = list()

with open(sys.argv[1]) as f:
    num_points = int(f.readline())
    points = f.readlines()
    first = points[0].split(" ")
    x = first[0]
    y = first[1]
    min_x = int(first[0])
    max_x = min_x
    min_y = int(first[1])
    max_y = min_y
   # print(x, y)
    for l in points:
        to_add = l.split(" ")
        x = (int(to_add[0]))
        y = int(to_add[1])
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)
        #print(x, y)
        #print(min_x, max_x, min_y, max_y)

        points_list.append((int(to_add[0]), int(to_add[1])))
#print(min_x, max_x, min_y, max_y)
width = max_x - min_x
height = max_y - min_y
point1 = Point(min_x - 1 - (width//2), min_y - (height//10) - 1)
point2 = Point(max_x + 1 + (width//2), min_y - (height//10) - 1)
point3 = Point((min_x + max_x)/2, max_y + 1 + height)
super_triangle = Triangle(point1, point2, point3)
super_triangle.plot_triangle()
triangulation.append(super_triangle)
center = super_triangle.get_circumcenter()
radius = super_triangle.get_circumradius()
print(center, radius)









for i in points_list:
    plt.scatter(i[0], i[1])
print(center.pair())

plt.gca().set_aspect("equal")
plt.gca().add_patch(plt.Circle(center.pair(), radius, fill=False))
plt.show()
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

    def __eq__(self, other):
        return (self.x == other.x) and (self.y == other.y)

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

    def __eq__(self, other):
        return (self.p1 == other.p1 and self.p2 == other.p2 and self.p3 == other.p3) or \
               (self.p1 == other.p2 and self.p2 == other.p3 and self.p3 == other.p1) or \
               (self.p1 == other.p3 and self.p2 == other.p1 and self.p3 == other.p2) or \
               (self.p1 == other.p1 and self.p2 == other.p3 and self.p3 == other.p2) or \
               (self.p1 == other.p2 and self.p2 == other.p1 and self.p3 == other.p3) or \
               (self.p1 == other.p3 and self.p2 == other.p2 and self.p3 == other.p1)
                #There's gotta be a better way of doing this but I don't know how

    def has_common_vertex(self, other):
        return (self.p1 == other.p1 or self.p1 == other.p2 or self.p1 == other.p3) or \
                (self.p2 == other.p1 or self.p2 == other.p2 or self.p2 == other.p3) or \
                (self.p3 == other.p1 or self.p3 == other.p2 or self.p3 == other.p3)

    def plot_triangle(self):
        plt.plot((self.p1.x, self.p2.x), (self.p1.y, self.p2.y))
        plt.plot((self.p2.x, self.p3.x), (self.p2.y, self.p3.y))
        plt.plot((self.p1.x, self.p3.x), (self.p1.y, self.p3.y))

    def get_edges(self):
        return (self.p1, self.p2), (self.p2, self.p3), (self.p3, self.p1)

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
        return (self.get_circumcenter() - point).mag() < self.get_circumradius()

    def has_edge(self, e1, e2):
        return (self.p1 == e1 or self.p2 == e1 or self.p3 == e1) and \
                (self.p1 == e2 or self.p2 == e2 or self.p3 == e2) and \
                (not(e1 == e2))

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
        x = int(to_add[0])
        y = int(to_add[1])
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        min_y = min(min_y, y)
        max_y = max(max_y, y)
        #print(x, y)
        #print(min_x, max_x, min_y, max_y)

        points_list.append(Point(int(to_add[0]), int(to_add[1])))
#print(min_x, max_x, min_y, max_y)
width = max_x - min_x
height = max_y - min_y
point1 = Point(min_x - 2 - (width//2), min_y - (height//10) - 1)
point2 = Point(max_x + 2 + (width//2), min_y - (height//10) - 1)
point3 = Point((min_x + max_x)//2, max_y + 1 + height + (height//2))
super_triangle = Triangle(point1, point2, point3)
#super_triangle.plot_triangle()
triangulation.append(super_triangle)
center = super_triangle.get_circumcenter()
radius = super_triangle.get_circumradius()
print(center, radius)





for i in points_list:

    bad = list()
    for t in triangulation:
        if t.in_circumscribe(i):
            bad.append(t)
    polygon = list()

    for t in bad:
        for e in t.get_edges():
            is_contained = False
            for k in bad:
                if not(t == k):
                    if k.has_edge(e[0], e[1]):
                        is_contained = True
            if (not(is_contained)):
                polygon.append(e)
    for t in bad:
        size_before = len(triangulation)
        triangulation.remove(t)
        print(size_before, len(triangulation))
    for e in polygon:
        newTri = Triangle(e[0], e[1], i)
        triangulation.append(newTri)


for t in triangulation:
    if t.has_common_vertex(super_triangle):
        #t.plot_triangle()
        size_before = len(triangulation)
        triangulation.remove(t)
        print(size_before, len(triangulation))

print(super_triangle)
for t in triangulation:
    if(not(t.has_common_vertex(super_triangle))):  #shouldn't be necessary since it was removed previously,
                                                   #but list.remove wasn't always working previously...
        t.plot_triangle()
    #plt.gca().add_patch(plt.Circle(t.get_circumcenter().pair(), t.get_circumradius(), fill=False))






for i in points_list:
    plt.scatter(i.x, i.y)
print(center.pair())

plt.gca().set_aspect("equal")
#plt.gca().add_patch(plt.Circle(center.pair(), radius, fill=False))
plt.show()
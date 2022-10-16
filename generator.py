import random
n = 30 #Number of points
m = 50 #range of points, from 0 to m on both axes
points = list()
with open("points.txt", 'w') as f:
    f.write(str(n) + "\n")
    for i in range(0, n):
        valid = True
        while(valid):
            x_axis = random.randrange(-m, m, 1)
            y_axis = random.randrange(-m, m, 1)
            if (x_axis, y_axis) not in points:
                points.append((x_axis, y_axis))
                valid = False
                f.write(str(x_axis) + " " + str(y_axis) + "\n")
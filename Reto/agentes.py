import agentpy as ap
import random
import math
# Visualization
import matplotlib.pyplot as plt

def toHex(rgb):
    return '%02x%02x%02x' % rgb

#               Izquierda   Abajo      Derecha     Arriba
directionsX = [[-500, -100],[-0.5, 0.5],[100, 500],[-0.5, 0.5]]
directionsZ = [[-0.5, 0.5],[-500, -100],[-0.5, 0.5],[100, 500]]
orientation = [0, 90, 180, 270]
carTypes = ["SUV", "Sedan", "Sport"]

class Vehicle(ap.Agent):
    def setup(self):
        r = int(random.random() * 255)
        g = int(random.random() * 255)
        b = int(random.random() * 255)
        self.color = toHex((r,g,b))

        self.carType = carTypes[int(random.random()*100)%2]

        origen = int(random.random() * 100)%4
        destino = int(random.random() * 100)%4
        self.x = (random.random() * directionsX[origen][1]) + directionsX[origen][0]
        self.z = (random.random() * directionsZ[origen][1]) + directionsZ[origen][0]
        self.direcction = orientation[origen]
        self.Fx = (random.random() * directionsX[destino][1]) + directionsX[destino][0]
        self.Fz = (random.random() * directionsZ[destino][1]) + directionsZ[destino][0]

        self.initialData()
        return
    def currentData(self):
        print('"id":', self.id, ",")
        print('"x":', self.x, ",")
        print('"z":', self.z, ",")
        print('"dir":', self.direcction)
        return
    def initialData(self):
        print('"id":',self.id,",")
        print('"type":',self.carType,",")
        print('"dir":',self.direcction,",")
        print('"origin": {')
        print('"x":',self.x,",")
        print('"z":',self.z,"")
        print('},')
        print('"destiny": {')
        print('"x":', self.Fx, ",")
        print('"z":', self.Fz, "")
        print('}')
        return

class Interseccion(ap.Model):
    def setup(self):
        self.agents = ap.AgentList(self, 10, Vehicle)
        return
    def step(self):
        return
    def end(self):
        return

def main():
    model = Interseccion()
    results = model.run()
    return

main()
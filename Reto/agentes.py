import agentpy as ap
import random
import math
# Visualization


def toHex(rgb):
    return '%02x%02x%02x' % rgb


#               Izquierda   Abajo      Derecha     Arriba
directionsX = [[-500, -100], [-0.5, 0.5], [100, 500], [-0.5, 0.5]]
directionsZ = [[-0.5, 0.5], [-500, -100], [-0.5, 0.5], [100, 500]]
orientation = [0, 90, 180, 270]
carTypes = ['"SUV"', '"Sedan"', '"Sport"']


class Vehicle(ap.Agent):
    def setup(self):
        r = int(random.random() * 255)
        g = int(random.random() * 255)
        b = int(random.random() * 255)
        self.color = toHex((r, g, b))

        self.carType = carTypes[int(random.random() * 100) % 2]

        origen = int(random.random() * 100) % 4
        destino = int(random.random() * 100) % 4
        self.x = (random.random() * directionsX[origen][1]) + directionsX[origen][0]
        self.z = (random.random() * directionsZ[origen][1]) + directionsZ[origen][0]
        self.direcction = orientation[origen]
        self.Fx = (random.random() * directionsX[destino][1]) + directionsX[destino][0]
        self.Fz = (random.random() * directionsZ[destino][1]) + directionsZ[destino][0]
        self.velocity = 1
        return

    def currentData(self):
        self.model.file.write("{")
        self.model.file.write('"id":'+str(self.id-1)+",")
        self.model.file.write('"x":'+str(self.x)+",")
        self.model.file.write('"z":'+str(self.z)+ ",")
        self.model.file.write('"dir":'+str(self.direcction))
        if (self.id != len(self.model.agents)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")
        return

    def initialData(self):
        self.model.file.write("{")
        self.model.file.write('"id":'+ str(self.id-1)+ ",")
        self.model.file.write('"type":'+ str(self.carType)+ ",")
        self.model.file.write('"dir":'+ str(self.direcction)+ ",")
        self.model.file.write('"origin": {')
        self.model.file.write('"x":'+str(self.x)+ ",")
        self.model.file.write('"z":'+str(self.z))
        self.model.file.write('},')
        self.model.file.write('"destiny": {')
        self.model.file.write('"x":'+ str(self.Fx)+ ",")
        self.model.file.write('"z":'+str(self.Fz))
        self.model.file.write('}')
        if(self.id != len(self.model.agents)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")

        return

    def Advance(self):
        this = self
        notMe = self.model.agents.select(self.model.agents.id != self.id)
        # for pitos in notMe:

        angle = self.direcction * math.pi / 180
        self.x = self.x + math.cos(angle) * self.velocity
        self.z = self.z + math.sin(angle) * self.velocity
        self.currentData()

        return


class Interseccion(ap.Model):
    def setup(self):
        self.frame = 0
        self.file = open("simul_data.json", "w")
        self.agents = ap.AgentList(self, 10, Vehicle)
        self.file.write("{")
        self.file.write('"cars": [')
        for car in self.agents:
            car.initialData()
        self.file.write("],")
        self.file.write('"frames": [')
        return

    def step(self):
        self.file.write("{")
        self.file.write('"frame": '+str(self.frame)+",")
        self.file.write('"cars": [')
        self.agents.Advance()
        self.file.write("]")
        self.file.write("},")
        self.frame = self.frame + 1
        if(self.frame > 1000):
            self.file.close()
            self.stop()
        return

    def end(self):
        return


def main():
    model = Interseccion()
    results = model.run()
    return


main()

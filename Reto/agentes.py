import agentpy as ap
import numpy as np
import random
import math
# Visualization
import matplotlib.pyplot as plt
import json


def toHex(rgb):
    return '%02x%02x%02x' % rgb


#               Izquierda   Abajo      Derecha     Arriba
# directionsX = [[-500, -100],[-0.5, 0.5],[100, 500],[-0.5, 0.5]]
# directionsZ = [[-0.5, 0.5],[-500, -100],[-0.5, 0.5],[100, 500]]
# orientation = [0, 90, 180, 270]
directionsX = [[-0.5, 0.5],[-0.5, 0.5]]
directionsZ = [[-500, -100],[100, 500]]

orientation = [90, 270]
carTypes = ["SUV", "Sedan", "Sport"]
filesito = {}


class Semaphore(ap.Agent):
    #Esta clase define a un semáforo.
    def setup(self):     
        self.step_time = 0.1         # Tiempo que dura cada paso de la simulación

        self.direction = orientation[0]    # Dirección a la que apunta el semáforo

        self.state = 0               # Estado del semáforo 0 = verde, 1 = amarillo, 2 = rojo
        self.state_time = 0          # Tiempo que ha durado el semáforo en el estado actual

        self.green_duration = 35     # Tiempo que dura el semáforo en verde
        self.yellow_duration = 7     # Tiempo que dura el semáforo en amarillo
        self.red_duration = 40       # Tiempo que dura el semáforo en rojo        

    def update(self):
        # Este método actualiza el estado del semáforo.
        self.state_time += self.step_time

        if self.state == 0:
            # Caso en el que el semáforo está en verde
            if self.state_time >= self.green_duration:
                self.state = 1
                self.state_time = 0
        elif self.state == 1:
            # Caso en el que el semáforo está en amarillo
            if self.state_time >= self.yellow_duration:
                self.state = 2
                self.state_time = 0
        elif self.state == 2:
            # Caso en el que el semáforo está en rojo
            if self.state_time >= self.red_duration:
                self.state = 0
                self.state_time = 0

class Vehicle(ap.Agent):
    def setup(self):
        r = random.randint(0,255)
        g = random.randint(0,255)
        b = random.randint(0,255)
        self.color = toHex((r,g,b))

        self.carType = carTypes[random.randint(0,2)]
        self.direction = 0



    def setupPos(self, espacio):
        # origen = random.randint(0,1) # genera numero aleatorio entre 0 y 3
        # destino = int(random.random() * 100)%4
        # self.x = (random.random() * directionsX[origen][1]) + directionsX[origen][0]
        # self.z = (random.random() * directionsZ[origen][1]) + directionsZ[origen][0]
        self.avenue = espacio
        posAux = espacio.positions[self]
        self.x = posAux[0]
        self.z = posAux[1]

        self.step_time = 0.1
        self.speed = 0.0 # velocidad en m/s
        self.max_speed = 30 # max velocidad en m/s
        self.state = 1 # 0 carro choco, 1 carro ok

        # self.Fx = (random.random() * directionsX[destino][1]) + directionsX[destino][0]
        # self.Fz = (random.random() * directionsZ[destino][1]) + directionsZ[destino][0]
      
    def currentData(self):
        print("Current",self.id)
        self.model.file.write("{")
        self.model.file.write('"id":' + str(self.id - 1) + ",")
        self.model.file.write('"x":' + str(self.x) + ",")
        self.model.file.write('"z":' + str(self.z) + ",")
        self.model.file.write('"dir":' + str(self.direction))
        if (self.id != len(self.model.cars)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")
        return

    def initialData(self):
        print("Initial",self.id)
        self.model.file.write("{")
        self.model.file.write('"id":' + str(self.id - 1) + ",")
        self.model.file.write('"type":' + str(self.carType) + ",")
        self.model.file.write('"dir":' + str(self.direction) + ",")
        self.model.file.write('"origin": {')
        self.model.file.write('"x":' + str(self.x) + ",")
        self.model.file.write('"z":' + str(self.z))
        self.model.file.write('}')
        if (self.id != len(self.model.cars)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")
        return

    def update_position(self):
        if self.state == 0:
            return
            # si el carro choco no se calcula nada
        
        #actualizamos posicion
        angle = self.direction*math.pi/180
        # self.x += self.speed*math.cos(self.angle)
        # self.z += self.speed*math.sin(self.angle)
        self.avenue.move_by(self, [self.speed*math.cos(angle), self.speed*math.sin(angle)])

        posAux = self.avenue.positions[self]
        self.x = posAux[0]
        self.z = posAux[1]

    def update_speed(self):
        # calculo de la velocidad del carro
        if self.state == 0:
            return
            # si el carro choco no se calcula nada
        angle = self.direction*math.pi/180
        #distancias entre vehiculos
        # p = self.model.avenue.positions[self]

        min_car_distance = 100000
        for car in self.model.cars:
            if car != self:
                #verificar si van en la misma direccion y si esta adelante
                if (self.direction - car.direction) == 0 and (((-self.x + car.x)*math.cos(angle)) + ((-self.z + car.z)*math.sin(angle))) > 0:
                    d = math.sqrt((self.x - car.x)**2 + (self.z - car.z)**2)

                    if min_car_distance > d:
                        min_car_distance = d

        min_semaphore_distance = 100000
        semaphore_state = 0
        for semaphore in self.model.semaphores:
            p = self.avenue.positions[semaphore]
            if  abs(self.direction - semaphore.direction) == 0 and (((p[0] - self.x) *math.cos(angle)) + ((p[1] - self.z) *math.sin(angle))) > 0:
                d = math.sqrt((self.x - p[0])**2 + (self.z - p[1])**2)
                if min_semaphore_distance > d:
                    min_semaphore_distance = d
                    semaphore_state = semaphore.state

                # Actualiza la velocidad del auto
        if min_car_distance < 2:
            self.speed = 0
            self.state = 1

        elif min_car_distance < 40:
              self.speed = np.maximum(self.speed - 250*self.step_time, 0)

        elif min_car_distance < 60:
              self.speed = np.maximum(self.speed - 120*self.step_time, 0)
                
        elif min_semaphore_distance < 60 and min_semaphore_distance > 30 and semaphore_state == 1:
            self.speed = np.minimum(self.speed + 2*self.step_time, self.max_speed)

        elif min_semaphore_distance < 80 and min_semaphore_distance > 30 and semaphore_state == 1:
            self.speed = np.maximum(self.speed - 10*self.step_time, 0)
            
        elif min_semaphore_distance < 100 and min_semaphore_distance > 30 and semaphore_state == 2:
            self.speed = np.maximum(self.speed - 100*self.step_time, 0)

        else:
            self.speed = np.minimum(self.speed + 5*self.step_time, self.max_speed)

class AvenueModel(ap.Model):
    """ Esta clase define un modelo para una avenida simple con semáforo peatonal. """

    def setup(self):
        """ Este método se utiliza para inicializar la avenida con varios autos y semáforos. """
        self.file = open("simul_data.json", "w")
        self.frame = 0
        # Inicializa los agentes los autos y los semáforos        
        self.cars = ap.AgentList(self, self.p.cars, Vehicle)
        self.cars.step_time =  self.p.step_time
        
        c_north = int(self.p.cars/2)
        c_south = self.p.cars - c_north

        for k in range(c_north):
            self.cars[k].direction = 270

        for k in range(c_south):
            self.cars[k+c_north].direction = 90

        self.semaphores = ap.AgentList(self,2, Semaphore)
        self.semaphores.step_time =  self.p.step_time
        self.semaphores.green_duration = self.p.green
        self.semaphores.yellow_duration = self.p.yellow
        self.semaphores.red_duration = self.p.red
        self.semaphores[0].direction = 90
        self.semaphores[1].direction = 270

        # Inicializa el entorno
        self.avenue = ap.Space(self, shape=[self.p.size, self.p.size], torus = True)
                
        # Agrega los semáforos al entorno
        self.avenue.add_agents(self.semaphores, random=True)
        self.avenue.move_to(self.semaphores[0], [self.p.size*0.5 - 5, self.p.size*0.5 + 5])
        self.avenue.move_to(self.semaphores[1], [self.p.size*0.5 + 5, self.p.size*0.5 - 5])

        # Agrega los autos al entorno
        self.avenue.add_agents(self.cars, random=True)
        for k in range(c_north):
            self.avenue.move_to(self.cars[k], [self.p.size*0.5 + 5, self.p.size- self.p.cars*11 +10*(k+1)])
        
        for k in range(c_south):
            self.avenue.move_to(self.cars[k+c_north], [self.p.size*0.5 - 5, -self.p.size + self.p.cars*11 - (k+1)*10])
        
        self.cars.setupPos(self.avenue)
        self.cars.initialData()

    def step(self):
        """ Este método se invoca para actualizar el estado de la avenida. """        
        self.semaphores.update()

        self.cars.update_position()
        self.cars.update_speed()
        self.file.write("{")
        self.file.write('"frame": ' + str(self.frame) + ",")
        self.file.write('"cars": [')
        self.cars.currentData()
        self.file.write("]")
        self.file.write("},")
        self.frame = self.frame + 1

    def end(self):
        self.file.write("]}")

parameters = {
    'step_time': 0.1,    # tiempo de cada paso
    'size': 1000,        # Tamaño en metros de la avenida
    'green': 2,          # Duración de la luz verde
    'yellow': 1,         # Duración de la luz amarilla
    'red': 4,           # Duración de la luz roja
    'cars': 10,          # Número de autos en la simulación
    'steps': 400,       # Número de pasos de la simulación
}

model = AvenueModel(parameters)
results = model.run()
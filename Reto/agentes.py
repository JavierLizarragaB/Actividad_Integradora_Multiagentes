import agentpy as ap
import numpy as np
import random
import math
# Visualization
# import matplotlib.pyplot as plt
# import matplotlib.animation
# import IPython


def toHex(rgb):
    return '%02x%02x%02x' % rgb

def votacion(a,b,c,d):
    #a = [0,1,2,3], prioridades (3->2->1->0)
    #b = [3,1,2,0], prioridades (0->2->1->3)
    #total = [3,2,4,3], prioridades (2->0,3->1)
    total = [a[0]+b[0]+c[0]+d[0], a[1]+b[1]+c[1]+d[1], a[2]+b[2]+c[2]+d[2], a[3]+b[3]+c[3]+d[3]]
    answ = []
    auxpos = 0
    for i in range(4):
        aux = 0
        for ii in range(4):
            if aux < total[ii]:
                auxpos = ii
                aux = total[ii]
        answ.append(auxpos)
        total[auxpos] = -1
    return answ
    
    
carTypes = ['"SUV"', '"Sedan"', '"Sport"']



class Semaphore(ap.Agent):
    # Esta clase define a un semáforo.
    def setup(self):
        self.nose = True #variable rara no supe donde ponerla alv
        self.type = -1
        self.orden = [0,0,0,0]
        self.step_time = 0.1  # Tiempo que dura cada paso de la simulación

        self.direction = 0  # Dirección a la que apunta el semáforo

        self.state = 2  # Estado del semáforo 0 = verde, 1 = amarillo, 2 = rojo
        self.state_time = 0  # Tiempo que ha durado el semáforo en el estado actual

        self.green_duration = 35  # Tiempo que dura el semáforo en verde
        self.yellow_duration = 7  # Tiempo que dura el semáforo en amarillo
        self.red_duration = 40  # Tiempo que dura el semáforo en rojo
    def setupSpas(self, espacio):
        self.avenue = espacio

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
    def set_green(self):
        """ Este método forza el semáforo a estar en verde. """        
        self.state = 0
        self.state_time = 0
    def currentData(self):
        self.model.file.write("{")
        self.model.file.write('"id":' + str(self.id - 1) + ",")
        self.model.file.write('"state":' + str(self.state) + ",")
        self.model.file.write('"dir":' + str(self.direction))
        if (self.id- len(self.model.cars) != len(self.model.semaphores)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")
        return
    def ordenarSemaphores(self):
        if self.type == 0: #semaforo que escoge aleatoriamente
            aux = 0
            self.orden[0] = random.randint(0,3)
            aux = random.randint(0,3)
            while aux == self.orden[0]:
                aux = random.randint(0,3)
            self.orden[1] = aux
            
            aux = random.randint(0,3)
            while aux == self.orden[0] or aux == self.orden[1]:
                aux = random.randint(0,3)
            self.orden[2] = aux
            
            aux = random.randint(0,3)
            while aux == self.orden[0] or aux == self.orden[1] or aux == self.orden[2]:
                aux = random.randint(0,3)
            self.orden[3] = aux
            return
        elif self.type == 1: #semaforo que escoge un orden random 1 vez
             if self.nose:
                self.nose = False
                aux = 0
                self.orden[0] = random.randint(0,3)
                aux = random.randint(0,3)
                while aux == self.orden[0]:
                    aux = random.randint(0,3)
                self.orden[1] = aux

                aux = random.randint(0,3)
                while aux == self.orden[0] or aux == self.orden[1]:
                    aux = random.randint(0,3)
                self.orden[2] = aux

                aux = random.randint(0,3)
                while aux == self.orden[0] or aux == self.orden[1] or aux == self.orden[2]:
                    aux = random.randint(0,3)
                self.orden[3] = aux
                return
        elif self.type == 2: #semaforo que escoge a si mismo nomas
            self.orden = [1,1,1,1]
            self.orden[self.id-self.p.cars] = 3
            return
        elif self.type == 3: #semaforo que escoge quien tenga mas carros
            prioriadorsmt = [0,0,0,0]
            i=0
            for semaphore in self.model.semaphores:
                angle = semaphore.direction * math.pi / 180
                min_semaphore_distance = 300
                cont = 0 #contador de cuantos carros tiene el wey
                p = self.avenue.positions[semaphore] #posicion del semaforo actual
                for car in self.model.cars:
                    if  abs(car.direction - semaphore.direction) == 0 and (((p[0] - car.x) *math.cos(angle)) + ((p[1] - car.z) *math.sin(angle))) > 0:
                        d = math.sqrt((car.x - p[0])**2 + (car.z - p[1])**2)
                        if min_semaphore_distance > d:
                            cont = cont +1
                prioriadorsmt[i]=cont
                i = 1+i
            answ = []
            auxpos = 0
            for i in range(4):
                aux = 0
                for ii in range(4):
                    if aux < prioriadorsmt[ii]:
                        auxpos = ii
                        aux = prioriadorsmt[ii]
                answ.append(auxpos)
                prioriadorsmt[auxpos] = -1
            self.orden = answ
            return




class Vehicle(ap.Agent):
    def setup(self):
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        self.color = toHex((r, g, b))
        self.carType = carTypes[random.randint(0, 2)]
        self.direction = 0
        self.carril = 0

    def setupPos(self, espacio):
        self.avenue = espacio
        posAux = espacio.positions[self]
        self.x = posAux[0]
        self.z = posAux[1]

        self.step_time = 0.1
        self.speed = 0.0 # velocidad en m/s
        self.max_speed = 25 # max velocidad en m/s
        self.state = 1 # 0 carro choco, 1 carro ok

    def currentData(self):
        self.model.file.write("{")
        self.model.file.write('"id":' + str(self.id - 1) + ",")
        self.model.file.write('"x":' + str(self.x -self.p.size/2) + ",")
        self.model.file.write('"z":' + str(self.z-self.p.size/2) + ",")
        self.model.file.write('"dir":' + str(self.direction))
        if (self.id != len(self.model.cars)):
            self.model.file.write("},")
        else:
            self.model.file.write("}")
        return

    def initialData(self):
        self.model.file.write("{")
        self.model.file.write('"id":' + str(self.id - 1) + ",")
        self.model.file.write('"type":' + str(self.carType) + ",")
        self.model.file.write('"dir":' + str(self.direction) + ",")
        self.model.file.write('"origin": {')
        self.model.file.write('"x":' + str(self.x-self.p.size/2) + ",")
        self.model.file.write('"z":' + str(self.z-self.p.size/2))
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

        # actualizamos posicion
        angle = self.direction * math.pi / 180
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
        angle = self.direction * math.pi / 180
        # distancias entre vehiculos
        # p = self.model.avenue.positions[self]

        min_car_distance = 100000
        min_car_distance2 = 100000
        for car in self.model.cars:
            if car != self:
                d = math.sqrt((self.x - car.x)**2 + (self.z - car.z)**2)
                if min_car_distance2 > d:
                    min_car_distance2 = d
                #verificar si van en la misma direccion y si esta adelante, y si esta en el mismo carril
                if (self.direction - car.direction) == 0 and (((-self.x + car.x)*math.cos(angle)) + ((-self.z + car.z)*math.sin(angle))) > 0 and self.carril == car.carril:
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
        if min_car_distance < 5:
            self.speed = 0
            self.state = 1
        elif min_car_distance < 40:
            self.speed = np.maximum(self.speed - 160*self.step_time, 0)
        elif min_car_distance < 60:
              self.speed = np.maximum(self.speed - 120*self.step_time, 2)
        elif min_semaphore_distance < 60 and min_semaphore_distance > 30 and semaphore_state == 1:
            self.speed = np.maximum(self.speed - 20*self.step_time, 5)
        elif min_semaphore_distance < 80 and min_semaphore_distance > 30 and semaphore_state == 1:
            self.speed = np.minimum(self.speed + 2*self.step_time, self.max_speed)
        elif min_semaphore_distance < 100 and semaphore_state == 2:
            if min_semaphore_distance > 50:
                self.speed = np.maximum(self.speed - 100*self.step_time, 6)
            elif min_semaphore_distance <= 50 and min_semaphore_distance > 42:
                self.speed = np.maximum(self.speed - 35*self.step_time, 0)
            elif min_semaphore_distance <= 40:
                self.speed = np.minimum(self.speed + 4 * self.step_time, self.max_speed)

        else:
            self.speed = np.minimum(self.speed + 3*self.step_time, self.max_speed)
        if min_car_distance2 < 5:
            self.speed = 0
            self.state = 1



class AvenueModel(ap.Model):
    """ Esta clase define un modelo para una avenida simple con semáforo peatonal. """

    def setup(self):
        """ Este método se utiliza para inicializar la avenida con varios autos y semáforos. """
        self.file = open("simul_data.json", "w")
        self.frame = 0
        # Inicializa los agentes los autos y los semáforos
        self.cars = ap.AgentList(self, self.p.cars, Vehicle)
        self.cars.step_time = self.p.step_time

        c_north = random.randint(1, int(self.p.cars/3))
        # c_south = int(self.p.cars/2 - c_north)
        c_east = random.randint(1, int(self.p.cars/3))
        # c_north = int(self.p.cars/4)
        c_south = int(self.p.cars/2 - c_north)
        # c_east = int(self.p.cars/4)
        c_west = self.p.cars - c_east - c_north - c_south

        for k in range(c_north):
            self.cars[k].direction = 90
        for k in range(c_south):
            self.cars[k + c_north].direction = 270
        for k in range(c_east):
            self.cars[k + c_north+c_south].direction = 0
        for k in range(c_west):
            self.cars[k + c_north+c_south+c_east].direction = 180

        self.semaphores = ap.AgentList(self, 4, Semaphore)
        self.semaphores.step_time = self.p.step_time
        self.semaphores.green_duration = self.p.green
        self.semaphores.yellow_duration = self.p.yellow
#         self.semaphores.red_duration = self.p.red
        self.semaphores[0].direction = 90
        self.semaphores[1].direction = 270
        self.semaphores[2].direction = 0
        self.semaphores[3].direction = 180
        self.semaphores[0].type = 0
        self.semaphores[1].type = 1
        self.semaphores[2].type = 2
        self.semaphores[3].type = 3
        

        # Inicializa el entorno
        self.avenue = ap.Space(self, shape=[self.p.size, self.p.size], torus = True)
                
        # Agrega los semáforos al entorno
        self.avenue.add_agents(self.semaphores, random=True)
        self.avenue.move_to(self.semaphores[0], [self.p.size*0.5 - 5, self.p.size*0.5 + 5])
        self.avenue.move_to(self.semaphores[1], [self.p.size*0.5 + 5, self.p.size*0.5 - 5])
        self.avenue.move_to(self.semaphores[2], [self.p.size*0.5 + 5, self.p.size*0.5 + 5])
        self.avenue.move_to(self.semaphores[3], [self.p.size*0.5 - 5, self.p.size*0.5 - 5])

        # Agrega los autos al entorno
        self.avenue.add_agents(self.cars, random=True)
        for k in range(c_north):
            if k % 4 == 0:
                self.cars[k].carril = 0
                self.avenue.move_to(self.cars[k], [self.p.size*0.5 - 0,-self.p.size+self.p.cars*11 -10*(k+1)])
            if k % 4 ==1:
                self.cars[k].carril = 1
                self.avenue.move_to(self.cars[k], [self.p.size*0.5 - 9,-self.p.size+self.p.cars*11-10*(k+1)])
            if k % 4 == 2:
                self.cars[k].carril = 2
                self.avenue.move_to(self.cars[k], [self.p.size*0.5 - 18,-self.p.size+self.p.cars*11 -10*(k+1)])
            if k % 4 ==3:
                self.cars[k].carril = 3
                self.avenue.move_to(self.cars[k], [self.p.size*0.5 - 27,-self.p.size+self.p.cars*11 -10*(k+1)])

        for k in range(c_south):
            if k % 3 == 0:
                self.cars[k+c_north].carril = 0
                self.avenue.move_to(self.cars[k+c_north], [self.p.size*0.5 + 7, self.p.size - self.p.cars*11 + (k+1)*10])
            if k % 3 == 1:
                self.cars[k+c_north].carril = 1
                self.avenue.move_to(self.cars[k+c_north], [self.p.size*0.5 + 15, self.p.size - self.p.cars*11 + (k+1)*10])
            if k % 3 == 2:
                self.cars[k+c_north].carril = 2
                self.avenue.move_to(self.cars[k+c_north], [self.p.size*0.5 + 21, self.p.size - self.p.cars*11 + (k+1)*10])

        for k in range(c_east):
            if k % 3 == 0:
                self.cars[k+c_north+c_south].carril = 0
                self.avenue.move_to(self.cars[k+c_north+c_south], [-self.p.size + self.p.cars*11 - (k+1)*10, self.p.size*0.5 + 7])
            if k % 3 == 1:
                self.cars[k+c_north+c_south].carril = 1
                self.avenue.move_to(self.cars[k+c_north+c_south], [-self.p.size + self.p.cars*11 - (k+1)*10, self.p.size*0.5 + 15])
            if k % 3 == 2:
                self.cars[k+c_north+c_south].carril = 2
                self.avenue.move_to(self.cars[k+c_north+c_south], [-self.p.size + self.p.cars*11 - (k+1)*10, self.p.size*0.5 + 21])

        for k in range(c_west):
            if k % 3 == 0:
                self.cars[k+c_east+c_south+c_north].carril = 0
                self.avenue.move_to(self.cars[k+c_east+c_south+c_north], [self.p.size- self.p.cars*11 +10*(k+1), self.p.size*0.5 - 7])
            if k % 3 == 1:
                self.cars[k+c_east+c_south+c_north].carril = 1
                self.avenue.move_to(self.cars[k+c_east+c_south+c_north], [self.p.size- self.p.cars*11 +10*(k+1), self.p.size*0.5 - 15])
            if k % 3 == 2:
                self.cars[k+c_east+c_south+c_north].carril = 2
                self.avenue.move_to(self.cars[k+c_east+c_south+c_north], [self.p.size- self.p.cars*11 +10*(k+1), self.p.size*0.5 - 21])
        
        self.cars.setupPos(self.avenue)
        self.semaphores.setupSpas(self.avenue)
        self.file.write("{")
        self.file.write('"cars": [')
        self.cars.initialData()
        self.file.write("],")
        self.file.write('"frames": [')
        
        self.cosofeo = (self.p.green+self.p.yellow)*10*4
        self.contadorChilo = 0
        self.ordencoso = [0,0,0,0]

    def step(self):
        if self.contadorChilo > self.cosofeo or self.contadorChilo == 0:
            self.contadorChilo = 0
            self.semaphores.ordenarSemaphores()
            self.ordencoso = [i for i in votacion(self.semaphores[0].orden, self.semaphores[1].orden, self.semaphores[2].orden, self.semaphores[3].orden)]
            self.semaphores[self.ordencoso[0]].set_green()
            
        elif self.contadorChilo == (self.p.green+self.p.yellow)*10+1:
            self.semaphores[self.ordencoso[1]].set_green()
        elif self.contadorChilo == (self.p.green+self.p.yellow)*2*10+1:
            self.semaphores[self.ordencoso[2]].set_green()
        elif self.contadorChilo == (self.p.green+self.p.yellow)*3*10+1:
            self.semaphores[self.ordencoso[3]].set_green()

        self.file.write("{")
        self.file.write('"frame": '+str(self.frame)+",")
        self.file.write('"cars": [')
        """ Este método se invoca para actualizar el estado de la avenida. """        
        self.semaphores.update()

        self.cars.update_position()
        self.cars.update_speed()
        self.cars.currentData()
        self.file.write('], "TL": [')
        self.semaphores.currentData()
        self.file.write("]")
    
        if(self.frame < self.p.steps-1):
            self.file.write("},")
        else:
            self.file.write("}")
        self.frame = self.frame + 1

        if(self.frame > self.p.steps-1):
            self.file.write("]}")
            self.file.close()
            self.stop()
            
        self.contadorChilo = self.contadorChilo + 1
        return

    



parameters = {
    'step_time': 0.1,    # tiempo de cada paso
    'size': 1000,        # Tamaño en metros de la avenida
    'green': 6,          # Duración de la luz verde
    'yellow': 3,         # Duración de la luz amarilla
    'red': 10,           # Duración de la luz roja
    'cars': 30,          # Número de autos en la simulación
    'steps': 1000,       # Número de pasos de la simulación
}


def main():
    # carAmount = int(input("Cuantos carros quiere simular: "))
    # stepAmount = int(input("Cuantos pasos quiere simular: "))
    # carAmount = 24
    # stepAmount = 1000
    # parameters['cars'] = carAmount
    # parameters['steps'] = stepAmount
    model = AvenueModel(parameters)
    results = model.run()
    return


main()


# def animation_plot_single(m, ax):    
#     ax.set_title(f"Avenida t={m.t*m.p.step_time:.2f}")
    
#     colors = ["green", "yellow", "red"]
    
#     pos_s1 = m.avenue.positions[m.semaphores[0]]    
#     ax.scatter(*pos_s1, s=20, c=colors[m.semaphores[0].state])
    
#     pos_s2 = m.avenue.positions[m.semaphores[1]]    
#     ax.scatter(*pos_s2, s=20, c=colors[m.semaphores[1].state])

#     pos_s1 = m.avenue.positions[m.semaphores[2]]    
#     ax.scatter(*pos_s1, s=20, c=colors[m.semaphores[2].state])
    
#     pos_s2 = m.avenue.positions[m.semaphores[3]]    
#     ax.scatter(*pos_s2, s=20, c=colors[m.semaphores[3].state])

#     ax.set_xlim(0, m.avenue.shape[0])
#     ax.set_ylim(0, m.avenue.shape[1])    
    
#     for car in m.cars:
#         pos_c = m.avenue.positions[car]    
#         ax.scatter(*pos_c, s=20, c="black")
    
#     ax.set_axis_off()
#     ax.set_aspect('equal', 'box')
        
# def animation_plot(m, p):    
#     fig = plt.figure(figsize=(10, 10))
#     ax = fig.add_subplot(111)
#     animation = ap.animate(m(p), fig, ax, animation_plot_single)
#     return IPython.display.HTML(animation.to_jshtml(fps=20)) 

# animation_plot(AvenueModel, parameters)
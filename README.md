# Actividad integradora multiagentes
## Primera parte
  Considere un juego de disparejo entre cuatro jugadores, en el que cada jugador adopta la siguiente estrategia:
  - El jugador 1 siempre escoge al azar entre las dos opciones.
  - El jugador 2 escoge siempre hacia abajo sin importar lo que haya ocurrido anteriormente.
  - El jugador 3 escoge la última opción ganadora de las partidas anteriores. En la primera jugada, escoge arriba.
  - El jugador 4 escoge aquello opuesto al jugador 1 en la última partida. En la primera jugada, escoge al azar.
 
## Segunda parte
  Modifica el ejemplo del fuego forestal (https://agentpy.readthedocs.io/en/latest/agentpy_forest_fire.html), de tal manera que sea posible iniciar el fuego en cualquier parte del entorno. A su vez, considera al menos tres diferentes tipos de árboles, los cuales se incendian con mayor o menor facilidad. Genere al menos 5 simulaciones, y presente los resultados en el PDF en el que se va a entregar con esta actividad.
  
## Tercera parte
  Considere que en una habitación con MxN espacios, hay P robots limpiadores reactivos. Cada uno de los robot limpiadores se comporta de la siguiente manera:
  - Si la celda en la que se encuentra está sucia, entonces aspira durante 10 segundos.
  - Si la celda está limpia, el robot elije una dirección aleatoria para moverse (unas de las 8 celdas vecinas que esté sin otro robot) y elije la acción de movimiento (si no puede moverse allí, permanecerá en la misma celda). Este movimiento dura 2 segundos.
  - Si varios robots coinciden en alguna de las celdas, uno se queda en dicha celda y los otros se tiene que mover a alguna otra celda. Quien se queda o quien se tiene que mover se elige aleatoriamente.
  Al inicio de la simulación, las posiciones de los robots son elegidas al azar, y de igual forma las posiciones están limpias o sucias aleatoriamente.

  Realiza al menos 5 simulaciones en este entorno con diferente número de robots, y reporta lo siguiente:
  - Tiempo necesario hasta que todas las celdas estén limpias.
  - Porcentaje de celdas limpias después del termino de la simulación.
  - Número de movimientos realizados por todos los agentes.

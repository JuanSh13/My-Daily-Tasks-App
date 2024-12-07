import { Component, computed, effect, signal, inject, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,  ReactiveFormsModule, Validators, FormControl } from '@angular/forms';

import { Task } from '../../interfaces/task';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor() {

  }

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if(storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks();
  }

  injector = inject(Injector);

  trackTasks() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, { injector: this.injector });
  }

  // Array de tareas utilizando signal
  tasks =  signal<Task[]>([]);


  // Crea un nuevo formulario reactivo que capta los datos de una nueva tarea segun los parametros de Validators
  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern('^\\S.*$'),
      Validators.minLength(3),
    ]
  });

  // Agraga los cambios de una nueva tarea de un formulario reactivo median la funcion (keydown.enter)
  changeHandler(event: Event) {
    if(this.newTaskCtrl.valid) {
      const value = this.newTaskCtrl.value;
      console.log("Valor del input: " + value);
      // Se agrega la tarea psasndole el parametro "Value" a la funcion addTask()
      this.addTask(value);
      // Borra o resetea el valor de input
      this.newTaskCtrl.setValue('');
    }
  }

  // Agregar una tarea
  addTask(title: string) {
    // Se crea la estructura de Interface propuesto
    const newTask = {
      id: Date.now(),
      title,
      completed: false
    }
    // Se agregan los datos a la array con su nueva Interface
    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  // Borra la tarea
  deleteTask(index: number) {
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  }

  // Actualiza el completado de la tarea
  updateTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if(position === index) {
          return {
            ...task,
            completed: !task.completed
          }
        }
        return task;
      });
    });

    // this.tasks.mutate(state  => {
    //   const currentTask = state[index];
    //   state[index] = {
    //     ...currentTask,
    //     completed: !currentTask.completed
    //   }
    // });
  }

  // Activa el estado de edicion de la tarea
  updateTaskEditingMode(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if(position === index) {
          return {
            ...task,
            editing: true
          };
        }
        return {
          ...task,
          editing: false
        };
      });
    });
  }

  // Edita y actualiza los datos de la tarea
  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if(position === index) {
          return {
            ...task,
            title: input.value,
            editing: false
          };
        }
        return task;
      });
    });
  }

  // Crea un Signal con parametro principal "all"
  filter = signal<'all' | 'pending' | 'completed'>('all');

  // Cambia el tipo de parametro del signal filter()
  changeFilter(filter: any) {
    this.filter.set(filter);
    console.log(filter);
  }

  // Computed
  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();

    if (filter === 'pending') {
      return tasks.filter(task => !task.completed);
    }
    if (filter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return tasks;
  });

  // changeHandler(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   const newTasks = input.value;
  //   this.tasks.update((tasks) => [...tasks, newTasks]);
  // }

  // deleteTask(index: number) {
  //   this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  // }

}

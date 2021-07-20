"use strict";

let tasks = [];

Vue.component('header-nav', {
  props: ['header'],
  template: `<nav class="light-blue darken-4">
  <div class="nav-wrapper">
    <router-link to="/" class="brand-logo">{{ header }}</router-link>
      <ul class="right hide-on-med-and-down">
        <router-link tag="li" to="/" exact active-class="active">
        <a href="#">Создать напоминание</a></router-link>
        <router-link tag="li" to="/list" active-class="active">
        <a href="#">Список напоминаний</a></router-link>
      </ul>
  </div>
  </nav>`,
});

const newTask = {
  name: "create",
  data: () => ({
    title: "",
    description: "",
    date: null,
    time: null,
  }),
  template: `<div class="new-task mt-2">
  <div class="container row">
    <div class="col s9 card">
      <h1>Создать напоминание</h1>
      <form class="pb-2" @submit.prevent="submitHandler">
        <div class="input-field">
          <input
            id="title"
            v-model="title"
            type="text"
            class="validate"
            required
          />
          <label for="title">Заголовок напоминания</label>
          <span
            class="helper-text"
            data-error="Поле необходимо заполнить"
          ></span>
        </div>
        <div class="input-field">
          <textarea
            id="description"
            v-model="description"
            class="materialize-textarea"
          ></textarea>
          <label for="description">Текст напоминания</label>
        </div>
        <div class="row">
          <div class="input-field col s6">
            <input id="date" type="text" ref="datepicker" required />
            <label for="date">Дата напоминания</label>
          </div>
          <div class="input-field col s6">
            <input id="time" type="text" ref="timepicker" required />
            <label for="time">Время напоминания</label>
          </div>
        </div>
        <button class="btn" type="submit">
          Создать напоминание
          <i class="material-icons right">done</i>
        </button>
      </form>
    </div>
    </div>
  </div>`,
  components: {},
  mounted() {
    this.date = M.Datepicker.init(this.$refs.datepicker, {
      format: "dd.mm.yyyy",
      defaultDate: new Date(),
      setDefaultDate: true,
    });
    this.time = M.Timepicker.init(this.$refs.timepicker, {
      twelveHour: false,
      defaultTime: '12:00',
    });
    setTimeout(() => {
      this.time._updateTimeFromInput();
      this.time.done();
    }, 0);
  },
  methods: {
    submitHandler() {
      const task = {
        title: this.title,
        description: this.description,
        id: Date.now(),
        status: new Date(new Date(this.date.date).setHours(this.time.time.slice(0, 2), this.time.time.slice(3, 5))) > new Date() ? "active" : "outdated",
        date: this.date.date,
        time: this.time.time,
        dateTime: new Date(new Date(this.date.date).setHours(this.time.time.slice(0, 2), this.time.time.slice(3, 5))),
      };
      this.$store.dispatch("createTask", task);
      this.$router.push("/list");
    },
  },
  destroyed() {
    if (this.date && this.date.destroy) {
      this.date.destroy();
    }
    if (this.time && this.time.destroy) {
      this.time.destroy();
    };
  },
};

const editTask = {
  computed: {
    task() {
      return this.$store.getters.taskById(+this.$route.params.id);
    },
  },
  data: () => ({
    description: "",
    date: null,
    time: null,
  }),
  template: `<div class="edit-task mt-2">
    <div class="container row">
    <div class="col s9 card" v-if="task">
      <h1>{{ task.title }}</h1>
      <form class="pb-2" @submit.prevent="submitHandler">
        <div class="input-field">
          <span
            class="helper-text"
            data-error="Поле необходимо заполнить"
          ></span>
        </div>
        <div class="input-field">
          <textarea
            id="description"
            v-model="description"
            class="materialize-textarea"
          ></textarea>
          <label for="description">Текст напоминания</label>
        </div>
        <div class="row">
          <div class="input-field col s6">
            <input id="date" type="text" ref="datepicker" required />
            <label for="date">Дата напоминания</label>
          </div>
          <div class="input-field col s6">
            <input id="time" type="text" ref="timepicker" required />
            <label for="time">Время напоминания</label>
          </div>
        </div>
        <div class="task-buttons">
          <button v-if="task.status !== 'completed'" class="btn" type="submit" style="margin-right: 1rem">
            Обновить
            <i class="material-icons right">refresh</i>
          </button>
          <button v-if="task.status !== 'completed'" class="btn blue" type="button" @click="completeTask" style="margin-right: 1rem">
            Завершить
            <i class="material-icons right">done_all</i>
          </button>
          <button class="btn red" type="button" @click="deleteTask">
            Удалить
            <i class="material-icons right">delete</i>
          </button>
        </div>
      </form>
    </div>
    <p v-else>Задача не найдена</p>
    </div>
  </div>`,
  components: {},
  mounted() {
    this.description = this.task.description;
    this.date = M.Datepicker.init(this.$refs.datepicker, {
      format: "dd.mm.yyyy",
      defaultDate: new Date(this.task.date),
      setDefaultDate: true,
    });
    this.time = M.Timepicker.init(this.$refs.timepicker, {
      twelveHour: false,
      defaultTime: this.task.time ? this.task.time : '12:00',
    });
    setTimeout(() => {
      M.updateTextFields();
      this.time._updateTimeFromInput();
      this.time.done();
    }, 0);
  },
  methods: {
    submitHandler() {
      this.$store.dispatch("updateTask", {
        id: this.task.id,
        description: this.description,
        date: this.date.date,
        time: this.time.time,
        dateTime: new Date(new Date(this.date.date).setHours(this.time.time.slice(0, 2), this.time.time.slice(3, 5))),
      });
      this.$router.push("/list");
    },
    completeTask() {
      this.$store.dispatch("completeTask", this.task.id);
      this.$router.push("/list");
    },
    deleteTask() {
      this.$store.dispatch("deleteTask", this.task.id);
      this.$router.push("/list");
    },
  },
  destroyed() {
    if (this.date && this.date.destroy) {
      this.date.destroy();
    }
    if (this.time && this.time.destroy) {
      this.time.destroy();
    }
  },
};

const tasksList = {
  data: () => ({
    filter: null,
    componentKey: 0,
  }),
  template: `<div class="tasks-list mt-2 mb-5">
  <div class="container card">
    <h1>Список напоминаний</h1>
    <div class="row" style="margin-bottom: 0">
      <div class="input-field col s6" v-if="tasks.length">
        <select ref="select" v-model="filter">
          <option value="" disabled selected>Выберите вариант:</option>
          <option value="active">Активные</option>
          <option value="outdated">Просроченные</option>
          <option value="completed">Завершённые</option>
        </select>
        <label>Фильтр напоминаний</label>
      </div>
    </div>
    <button class="btn btn-small red" v-if="filter" @click="filter = null">
      Очистить фильтр
    </button>
    <hr />
    <table v-if="tasks.length" :key="componentKey">
      <thead>
        <tr>
          <th>#</th>
          <th>Заголовок</th>
          <th>Срок выполнения</th>
          <th>Напоминание</th>
          <th>Статус</th>
          <th>Детали</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(task, index) of displayTasks" :key="task.id">
          <td>{{ index + 1 }}</td>
          <td class="title-cell">
            <div class="title-text">{{ task.title }}</div>
          </td>
          <td>
            {{ new Date(task.dateTime).toLocaleString() }}
          </td>
          <td class="description-cell">
            <div class="description-text">{{ task.description }}</div>
          </td>
          <td v-if="task.status === 'outdated'" style="color: #f44336; font-weight: 500;">Просрочена</td>
          <td v-else-if="task.status === 'active'" style="color: #26a69a; font-weight: 500;">Активна</td>
          <td v-else-if="task.status === 'completed'" style="color: #2196f3; font-weight: 500;">Завершена</td>
          <td>
            <router-link
                tag="button"
                class="btn btn-small"
                :to="'/task/' + task.id"
                >Просмотр</router-link>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="mt-2 mb-2">Нет напоминаний</p>
    </div>
  </div>`,
  beforeUpdate() {
    this.$store.getters.tasks.map(task => {
      if (new Date(task.dateTime) < new Date() && task.status !== 'completed') {
        task.status = 'outdated';
      };
    });
  },
  created() {
    setInterval(() => {
      this.componentKey++
    }, 60000)
  },
  computed: {
    tasks() {
      return this.$store.getters.tasks;
    },
    displayTasks() {
      return this.tasks.filter((t) => {
        if (!this.filter) {
          return true;
        }
        return t.status === this.filter;
      });
    },
  },
  methods: {},
  mounted() {
    M.FormSelect.init(this.$refs.select);
  },
};

const store = new Vuex.Store({
  state: {
    tasks: JSON.parse(localStorage.getItem('tasks') || '[]').map(task => {
      if (new Date(task.dateTime) < new Date() && task.status !== 'completed') {
        task.status = 'outdated'
      };
      return task;
    }),
  },
  mutations: {
    createTask(state, task) {
      state.tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(state.tasks));
      console.log(task);
      console.log(state.tasks);
    },
    updateTask(state, {
      id,
      description,
      date,
      time,
      dateTime,
    }) {
      const tasks = state.tasks.concat();
      const index = tasks.findIndex(task => task.id === id);
      const task = tasks[index];
      const status = new Date(dateTime) > new Date() ? 'active' : 'outdated';
      tasks[index] = {
        ...task,
        description,
        date,
        time,
        dateTime,
        status
      };
      state.tasks = tasks,
        localStorage.setItem('tasks', JSON.stringify(state.tasks));
    },
    completeTask(state, id) {
      const index = state.tasks.findIndex(t => t.id === id)
      state.tasks[index].status = 'completed'
      localStorage.setItem('tasks', JSON.stringify(state.tasks))
    },
    deleteTask(state, id) {
      const index = state.tasks.findIndex(t => t.id === id)
      state.tasks.splice(index, 1)
      localStorage.setItem('tasks', JSON.stringify(state.tasks))
    },
  },
  actions: {
    createTask({
      commit
    }, task) {
      commit('createTask', task)
    },
    updateTask({
      commit
    }, task) {
      commit('updateTask', task)
    },
    completeTask({
      commit
    }, id) {
      commit('completeTask', id)
    },
    deleteTask({
      commit
    }, id) {
      commit('deleteTask', id)
    },
  },
  modules: {},
  getters: {
    tasks: s => s.tasks,
    taskById: s => id => s.tasks.find(t => t.id === id),
  },
});

Vue.use(VueRouter);

const routes = [{
    path: '/',
    name: 'create',
    component: newTask,
  },
  {
    path: '/list',
    name: 'list',
    component: tasksList,
  },
  {
    path: '/task/:id',
    name: 'task',
    component: editTask,
  }
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

const app = new Vue({
  el: '#app',
  store,
  router,
  data: {
    header: 'Задачи (тестовое задание)',
  },
  methods: {},
});




























// LocalStorage:

const toLocal = (tasksList) => {
  localStorage.setItem([tasksList.toString()], JSON.stringify(tasks));
};

const fromLocal = (tasksList) => {
  if (JSON.parse(localStorage[tasksList.toString()]).length != 0) {
    const list = JSON.parse(localStorage[tasksList.toString()]);
    for (let i = 0; i < list.length; i++) {
      // createClient(list[i].id, list[i].surname, list[i].name, list[i].middlename, list[i].contacts, list[i].createDate, list[i].editDate);
    };
  };
};

// const loadTasks = async () => {
//   try {
//     const response = await fetch('https://europe-west1-st-testcase.cloudfunctions.net', {
//       method: 'GET',
//     });
//     if (response.ok) {
//       const data = await response.json();
//       console.log(data);
//     };
//   } catch (e) {
//     console.error(e);
//   };
// };

// loadTasks();
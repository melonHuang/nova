'use strict';

;(function () {
  var components_todo_list_main;
  (function () {
    (function (root, factory) {
      if (typeof exports === 'object') {
        module.exports = factory();
      } else if (true) {
        components_todo_list_main = (function () {
          return typeof factory === 'function' ? factory() : factory;
        })();
      } else {
        var globalAlias = 'Nova.Components.TodoList';
        var namespace = globalAlias.split('.');
        var parent = root;
        for (var i = 0; i < namespace.length - 1; i++) {
          if (parent[namespace[i]] === undefined) parent[namespace[i]] = {};
          parent = parent[namespace[i]];
        }
        parent[namespace[namespace.length - 1]] = factory();
      }
    })(this, function () {
      function _requireDep(name) {
        return ({})[name];
      }
      var _bundleExports = undefined;
      NovaExports.__fixedUglify = 'script>';
      NovaExports.exports = {
        'stylesheet': ':host{display:block;padding:15px 20px;border:1px solid rgba(16,16,16,.1);background:#fff}h3{font-size:24px;line-height:40px;margin:0}p{margin:10px 0}ul{margin:20px 0;list-style-type:square;padding-left:0}ul li{margin-left:20px;height:20px}ul li p{display:inline-block;vertical-align:middle;margin:0}.todo-done{text-decoration:line-through}',
        'template': '\n        <h3>TODO</h3>\n        <div>\n            <form on-submit="{{addTodo}}">\n                <input type="text" value="{{todoText::change}}">\n                <button>Submit</button>\n            </form>\n            <ul>\n                <template class="template-repeat" on-item-changed="{{changeTodoStatus}}" is="template-repeat" items="{{todos}}">\n                <li>\n                    <p class_="todo-{{item.done ? &apos;done&apos; : &apos;undone&apos;}}">{{item.text}}</p>\n                    <input type="checkbox" checked="{{item.done::change}}">\n                </li>\n                </template>\n            </ul>\n            <p>{{remaining}} of {{todos.length}} items left.</p>\n        </div>\n    '
      };
      'use strict';
      var TodoList = NovaExports({
        is: 'todo-list',
        props: {
          todos: {
            type: Array,
            value: function value() {
              return [];
            }
          },
          remaining: {
            type: Number,
            value: 0
          },
          todoText: {
            type: String,
            value: ''
          }
        },
        createdHandler: function createdHandler() {},
        addTodo: function addTodo(e) {
          e.preventDefault();
          this.todos = this.todos.concat({ text: this.todoText });
          this.todoText = '';
        },
        changeTodoStatus: function changeTodoStatus() {
          var remaining = 0;
          this.todos.forEach(function (todo) {
            if (!todo.done) {
              remaining++;
            }
          });
          this.remaining = remaining;
        }
      });
      return TodoList;
      return _bundleExports;
    });
  }).call(window);
})();
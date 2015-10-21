'use strict';

;(function () {
  (function () {
    (function (root, factory) {
      if (typeof exports === 'object') {
        module.exports = factory();
      } else if (typeof define === 'function' && define.amd) {
        define('components/todo-list/main', [], factory);
      } else {
        var globalAlias = 'TodoList';
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
        'stylesheet': '.todo-done{text-decoration:line-through}',
        'template': '\n        <h2>Todo</h2>\n        <div>\n            <p>\n                {{remaining}} of {{todos.length}} remaining\n            </p>\n            <ul>\n                <template class="template-repeat" on-item-changed="{{changeTodoStatus}}" is="template-repeat" items="{{todos}}">\n                <li>\n                    <input type="checkbox" checked="{{item.done::change}}">\n                    <p class_="todo-{{item.done ? &apos;done&apos; : &apos;undone&apos;}}">\n                        {{item.text}}\n                    </p>\n                </li>\n                </template>\n            </ul>\n\n            <form on-submit="{{addTodo}}">\n                <input type="text" value="{{todoText::change}}">\n                <button>Submit</button>\n            </form>\n        </div>\n    '
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
        createdHandler: function createdHandler() {
          this.repeat = this.querySelector('.template-repeat');
        },
        addTodo: function addTodo(e) {
          e.preventDefault();
          this.todos.push({ text: this.todoText });
          this.todos = this.todos.slice();
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
      return _bundleExports;
    });
  }).call(window);
})();
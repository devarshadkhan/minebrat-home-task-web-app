"use client";

import { useState } from "react";

// Type definition for Todo item
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Function to load todos from local storage
const loadTodosFromStorage = (): Todo[] => {
  if (typeof window !== 'undefined') {
    const storedTodos = window.localStorage.getItem("todos");
    return storedTodos ? JSON.parse(storedTodos) : [];
  }
  return []; // Return an empty array or handle server-side case
};

// Function to save todos to local storage
const saveTodosToStorage = (todos: Todo[]) => {
  try {
    window.localStorage.setItem("todos", JSON.stringify(todos));
  } catch (error) {
    console.error("Error saving todos to localStorage:", error);
  }
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>(loadTodosFromStorage());
  const [text, setText] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle adding or editing a todo
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Please add some text to your todo.");
      return;
    }

    const isDuplicate = todos.some((todo) => todo.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate && !editingId) {
      setError("This todo already exists.");
      setText("");
      return;
    }

    let updatedTodos: Todo[];

    if (editingId) {
      updatedTodos = todos.map((todo) =>
        todo.id === editingId ? { ...todo, text } : todo
      );
      setEditingId(null);
    } else {
      const newTodo: Todo = {
        id: String(Date.now()),
        text,
        completed: false,
      };
      updatedTodos = [...todos, newTodo];
    }

    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
    setText("");
  };

  // Handle toggling the completion status of a todo
  const toggleComplete = (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
  };

  // Handle deleting a todo
  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    saveTodosToStorage(updatedTodos);
  };

  // Handle editing a todo
  const editTodo = (id: string, currentText: string) => {
    setText(currentText);
    setEditingId(id);
    setError(null);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="w-full mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-black">Todo List</h2>

        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Form to add/edit todos */}
        <form onSubmit={handleSubmit} className="flex items-center mb-4">
          <input
            type="text"
            placeholder={editingId ? "Edit todo" : "Add a new todo"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" 
          />
          <button type="submit" className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600">
            {editingId ? "Update Todo" : "Add Todo"}
          </button>
        </form>

        {/* Todo List */}
       {todos.length > 0 &&  <ul className="space-y-4">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md">
              <span className={`flex-grow ${todo.completed ? "line-through text-black" : "text-black"}`}>
                {todo.text}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => toggleComplete(todo.id)}
                  className="bg-gray-300 text-gray-700 rounded-lg py-1 px-3 hover:bg-gray-400"
                >
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => editTodo(todo.id, todo.text)}
                  className="bg-yellow-400 text-white rounded-lg py-1 px-3 hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white rounded-lg py-1 px-3 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>}

        <div className="mt-4 text-gray-500">
          You have {todos.length} todos
        </div>
      </div>
    </div>
  );
}

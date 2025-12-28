import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { Todo } from '../components/Todo/types';

interface TodoContextType {
    todos: Todo[];
    addTodo: (todo: Omit<Todo, 'id'>) => void;
    updateTodo: (id: string, updates: Partial<Todo>) => void;
    deleteTodo: (id: string) => void;
    toggleTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [todos, setTodos] = useState<Todo[]>(() => {
        const savedTodos = localStorage.getItem('global_todos');
        return savedTodos ? JSON.parse(savedTodos) : [];
    });

    useEffect(() => {
        localStorage.setItem('global_todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = (newTodo: Omit<Todo, 'id'>) => {
        const todo: Todo = {
            ...newTodo,
            id: Math.random().toString(36).substr(2, 9)
        };
        setTodos(prev => [...prev, todo]);
    };

    const updateTodo = (id: string, updates: Partial<Todo>) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    return (
        <TodoContext.Provider value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo }}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodoContext = () => {
    const context = useContext(TodoContext);
    if (!context) {
        throw new Error('useTodoContext must be used within a TodoProvider');
    }
    return context;
};

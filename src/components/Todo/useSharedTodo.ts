import { useTodoContext } from '../../context/TodoContext';
import { useMemo } from 'react';

export const useSharedTodo = () => {
    const { todos, addTodo, updateTodo, deleteTodo, toggleTodo } = useTodoContext();

    const getTodosByDate = useMemo(() => (date: Date) => {
        const dateString = date.toISOString().split('T')[0];

        return todos.filter(todo => {
            const start = new Date(todo.startDate);
            const end = new Date(todo.endDate);
            const current = new Date(dateString);

            // Should verify this logic strictly. 
            // Simple comparison for now: check if current date is within range (inclusive)
            // But need to strip time from start/end for accurate date comparison if strings contain time?
            // The existing Daily.tsx used string comparison with Date object conversion.

            // Let's mimic Daily.tsx logic exactly for consistency
            // Daily.tsx logic:
            // const start = new Date(todo.startDate);
            // const end = new Date(todo.endDate);
            // const current = new Date(currentDateString);
            // return current >= start && current <= end;

            return current >= start && current <= end;
        });
    }, [todos]);

    const getTodayTodos = () => {
        const today = new Date();
        // Reset time to 00:00:00 to match just date comparison if using Date objects,
        // but let's stick to the getTodosByDate logic which takes a Date object.
        return getTodosByDate(today);
    };

    return {
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        getTodosByDate,
        getTodayTodos
    };
};

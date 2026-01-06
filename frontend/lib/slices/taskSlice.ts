import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "@/constants/interface";

interface TaskState {
    tasks: Task[];
    selectedTask: Task | null;
    loading: boolean;
    error: string | null;
}

const initialState: TaskState = {
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null
};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        setTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;
            state.loading = false;
            state.error = null;
        },
        addTask: (state, action: PayloadAction<Task>) => {
            state.tasks.unshift(action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex(task => task._id === action.payload._id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
            if (state.selectedTask?._id === action.payload._id) {
                state.selectedTask = action.payload;
            }
        },
        removeTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task._id !== action.payload);
        },
        setSelectedTask: (state, action: PayloadAction<Task | null>) => {
            state.selectedTask = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const {
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setSelectedTask,
    setLoading,
    setError
} = taskSlice.actions;

export default taskSlice.reducer;

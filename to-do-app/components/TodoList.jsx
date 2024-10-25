// components/TodoList.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const priorityColors = {
  high: "bg-red-200 border-red-500",
  medium: "bg-yellow-200 border-yellow-500",
  low: "bg-green-200 border-green-500",
};

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [overallProgress, setOverallProgress] = useState(0);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      fetchTasks();
    }
  }, [session, router]);

  useEffect(() => {
    updateOverallProgress();
  }, [tasks]);

  const fetchTasks = async () => {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (newTask.trim()) {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newTask.trim(),
          priority,
          dueDate,
        }),
      });
      const newTaskData = await response.json();
      setTasks([...tasks, newTaskData]);
      setNewTask("");
      setPriority("medium");
      setDueDate(null);
    }
  };

  const toggleTaskCompletion = async (id) => {
    const taskToUpdate = tasks.find((task) => task._id === id);
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...taskToUpdate, completed: !taskToUpdate.completed }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const deleteTask = async (id) => {
    await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find((task) => task._id === id);
    setEditingTask(taskToEdit);
    setNewTask(taskToEdit.text);
    setPriority(taskToEdit.priority);
    setDueDate(taskToEdit.dueDate);
  };

  const updateTask = async () => {
    const response = await fetch(`/api/tasks/${editingTask._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...editingTask, text: newTask, priority, dueDate }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === editingTask._id ? updatedTask : task)));
    setEditingTask(null);
    setNewTask("");
    setPriority("medium");
    setDueDate(null);
  };

  const addSubtask = async (taskId, subtaskText) => {
    const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: subtaskText }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const toggleSubtaskCompletion = async (taskId, subtaskId) => {
    const task = tasks.find((t) => t._id === taskId);
    const subtask = task.subtasks.find((s) => s._id === subtaskId);
    const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...subtask, completed: !subtask.completed }),
    });
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "DELETE",
    });
    setTasks(
      tasks.map((task) =>
        task._id === taskId
          ? { ...task, subtasks: task.subtasks.filter((subtask) => subtask._id !== subtaskId) }
          : task
      )
    );
  };

  const handleInputChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      editingTask ? updateTask() : addTask();
    }
  };

  const updateOverallProgress = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    setOverallProgress(progress);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.completed) ||
      (filterStatus === "active" && !task.completed);
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Advanced To-Do List</h1>
      {session ? (
        <>      
          <div className="space-y-4 mb-6">
            <Input
              type="text"
              value={newTask}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task"
            />
            <div className="flex space-x-2">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button 
              onClick={editingTask ? updateTask : addTask}
              className="w-full"
            >
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-2 mb-2">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Overall Progress:</span>
              <motion.div
                className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-blue-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
              <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {filteredTasks.map((task) => (
              <AccordionItem key={task.id} value={`task-${task.id}`}>
                <AccordionTrigger className={`p-3 rounded-lg border ${priorityColors[task.priority]}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <span className={task.completed ? "line-through text-gray-500" : ""}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.dueDate && (
                        <span className="text-sm text-gray-500">
                          Due: {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => editTask(task.id)}>
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-6 space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={() => toggleSubtaskCompletion(task.id, subtask.id)}
                        />
                        <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                          {subtask.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubtask(task.id, subtask.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Add subtask"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            addSubtask(task.id, e.target.value.trim());
                            e.target.value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          if (input.value.trim()) {
                            addSubtask(task.id, input.value.trim());
                            input.value = "";
                          }
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
    ) : (
      <p>Please log in to view and manage your tasks.</p>
    )}

    </div>
  );
};

export default TodoList;
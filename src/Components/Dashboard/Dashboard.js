import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import axios from "axios";
import "./dashboard.css";
import Task from "./Task";
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [tasks, setTasks] = useState(localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : []);
  const [visible, setVisible] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    const cachedData = localStorage.getItem('tasks');
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (Array.isArray(parsedData)) {
          setTasks(parsedData); // Only set if it's a valid array
        }
      } catch (error) {
        console.error('Error parsing cached data', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },[tasks]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const newTask = { id: uuidv4(), title, description, status, date: new Date().toISOString()};

    try {
      setTasks([...tasks, newTask]);
      setTitle("");
      setDescription("");
      setStatus("todo");
      setVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
  };

  const closeViewModal = () => {
    setViewTask(null);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const date = new Date(dateString);
    // return date.toLocaleDateString("en-GB", options).replace(/, /g, ", ");
    return date.toLocaleDateString();
  };

  const getFilteredTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    .sort((a, b) => {
      if (sortOrder === "recent") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, TouchSensor, KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeTask = tasks.find((task) => task.id === active.id);
    const overTask = tasks.find((task) => task.id === over.id);

    if (!activeTask) {
      return;
    }

    let updatedTasks;

    if (!overTask || activeTask.status !== overTask.status) {
      // Moving task between different lists or into an empty list
      const targetStatus = overTask ? overTask.status : over.id;

      updatedTasks = tasks.map((task) => {
        if (task.id === active.id) {
          return {
            ...task,
            status: targetStatus, // Update task status
          };
        }
        return task;
      });

    } else {
      // Reordering task within the same list
      const activeIndex = tasks.findIndex((task) => task.id === active.id);
      const overIndex = tasks.findIndex((task) => task.id === over.id);

      if (activeIndex !== overIndex) {
        updatedTasks = arrayMove(tasks, activeIndex, overIndex);
      }
    }
    
    if (updatedTasks) {
      setTasks(updatedTasks); // Update the state
    }
  };

  
  return (
    <div className="main-div">
      <button className="a-btn" onClick={() => setVisible(true)}>
        Add Task
      </button>
      <Dialog
        className="add-task"
        header="New Task Details"
        visible={visible}
        style={{ width: "35vw", height: "35vw" }}
        onHide={() => {
          setVisible(false);
          setTitle("");
          setDescription("");
          setStatus("todo");
        }}
        footer={
          <div className="footer-div">
            <Button
              label="Save"
              onClick={handleAddTask}
              autoFocus
            />
            <Button
              label="Cancel"
              onClick={() => {
                setVisible(false);
                setTitle("");
                setDescription("");
                setStatus("todo");
              }}
            />
          </div>
        }
      >
        <form>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <br />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <br />
          <select onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">To do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </form>
      </Dialog>

      {viewTask && (
        <Dialog
          className="view-task"
          header="Task Details"
          visible={true}
          style={{ width: "35vw", height: "35vw" }}
          onHide={closeViewModal}
          footer={
            <div className="footer-div">
              <Button label="Close" onClick={closeViewModal} autoFocus />
            </div>
          }
        >
          <div>
            <h4>Title: {viewTask.title}</h4>
            <p>Description: {viewTask.description}</p>
            <p>Created At: {new Date(viewTask.date).toLocaleString()}</p>
          </div>
        </Dialog>
      )}

      <div className="filter-div">
        <span>
          Search :{" "}
          <input
            type="text"
            placeholder="Search...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </span>
        <span>
          Sort by :
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </span>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="cards-div">
          {["todo", "in-progress", "done"].map((status) => (
            <SortableContext
              key={status}
              items={getFilteredTasks(status).map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="card" key={status}>
                <p className="heading">
                  {status.toUpperCase().replace("-", " ")}
                </p>
                {getFilteredTasks(status).map((task) => (
                  <Task
                    key={task.id}
                    task={task}
                    onFormat={formatDate}
                    onViewTask={handleViewTask}
                  />
                ))}
                {getFilteredTasks(status).length === 0 && (
                  <div className="empty-list-placeholder" id={status}>
                    No Tasks Yet
                  </div>
                )}
              </div>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default Dashboard;

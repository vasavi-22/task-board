import React from "react";
import "./dashboard.css";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleExclamation, faClock } from "@fortawesome/free-solid-svg-icons";

const Task = ({ task, onFormat, onViewTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleButtonClick = (e, callback) => {
    e.stopPropagation(); // Prevents the drag event from being triggered
    callback();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task"
    >
      <div {...attributes} {...listeners} className="task-drag-handle">
        <p className="title">{task.title}</p>
        <p>{task.description}</p>
        <p>Status : {task.status === "done" ? 
          <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: "1.5em", color: "green"}} /> 
          : task.status === "in-progress" ? <FontAwesomeIcon icon={faClock} style={{ fontSize: "1.5em", color: "#ff7900" }} /> : <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: "1.5em", color: "007fff" }} />}</p>
        <p className="time">Created at : {onFormat(task.date)}</p>
      </div>
      <div className="btns">
        <button
          className="view"
          onClick={(e) => handleButtonClick(e, () => onViewTask(task))}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default Task;

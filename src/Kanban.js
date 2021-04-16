import React from "react";
import { DragDropContext, DropTarget, DragSource } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";
import axios from "axios";

const labels = ["backlog", "new", "going", "review", "done"];
const labelsMap = {
  backlog: "Backlog",
  new: "To Do",
  going: "In Progress",
  review: "Review",
  done: "Done",
};

const classes = {
  board: {
    display: "flex",
    margin: "0 auto",
    width: "90vw",
    fontFamily: 'Arial, "Helvetica Neue", sans-serif',
  },
  column: {
    minWidth: 200,
    width: "18vw",
    height: "80vh",
    margin: "0 auto",
    backgroundColor: "#566573",
  },
  columnHead: {
    textAlign: "center",
    padding: 10,
    fontSize: "1.2em",
    backgroundColor: "#7F8C8D",
    color: "white",
  },
  item: {
    padding: 10,
    margin: 10,
    fontSize: "0.8em",
    cursor: "pointer",
    backgroundColor: "white",
  },
};

class Kanban extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      taskName: null,
      taskStatus: null,
    };
  }

  getTask = (e) => {
    // name = e.target.name;
    // value = e.target.value;
    // this.setState(
    //   {
    //     [name]: value,
    //   },
    //   console.log(this.state)
    // );
  };

  addTask = (data) => {
    axios({
      url: `https://6007a255309f8b0017ee4a1b.mockapi.io/todo/ToDoList`,
      method: "POST",
      data: data,
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  displayRes = (labels, tasks) => {
    return labels.map((channel) => (
      <KanbanColumn status={channel}>
        <div style={classes.column}>
          <div style={classes.columnHead}>{labelsMap[channel]}</div>
          <div>
            {tasks
              .filter((item) => item.status === channel)
              .map((item) => (
                <KanbanItem id={item._id} onDrop={this.update}>
                  <div style={classes.item}>{item.title}</div>
                </KanbanItem>
              ))}
          </div>
        </div>
      </KanbanColumn>
    ));
  };

  componentDidMount = () => {
    console.log("Did mount");
    axios({
      url: `https://6007a255309f8b0017ee4a1b.mockapi.io/todo/ToDoList`,
      method: "GET",
    })
      .then((res) => {
        console.log(res.data);
        this.setState({
          tasks: res.data,
        });
      })
      .catch((err) => {
        console.log(err.data);
      });
  };

  update = (id, status) => {
    const { tasks } = this.state;
    const task = tasks.find((task) => task._id === id);
    // console.log("task", task);
    task.status = status;
    const taskIndex = tasks.indexOf(task);
    const newTasks = update(tasks, {
      [taskIndex]: { $set: task },
    });
    console.log("newTask", newTasks);
    this.setState({ tasks: newTasks });
  };

  render() {
    const { tasks } = this.state;
    return (
      <main>
        <header className="header">Example Kanban Board </header>

        <div className="container">
          <div className="form-group ">
            <label htmlFor="usr">Name:</label>
            <input
              onChange={this.getTask}
              name="name"
              type="text"
              className="form-control"
              id="usr"
            />
          </div>
          <div className="form-group ">
            <label htmlFor="pwd">Status:</label>
            <input
              onChange={this.getTask}
              name="status"
              type="text"
              className="form-control"
              id="pwd"
            />
          </div>
          <button className="btn btn-danger col-6 mb-5">Add</button>
        </div>

        <section style={classes.board}>
          {this.displayRes(labels, tasks)}
        </section>
      </main>
    );
  }
}

export default DragDropContext(HTML5Backend)(Kanban);

// Column

const boxTarget = {
  drop(props) {
    return { name: props.status };
  },
};

class KanbanColumn extends React.Component {
  render() {
    return this.props.connectDropTarget(<div>{this.props.children}</div>);
  }
}

KanbanColumn = DropTarget("kanbanItem", boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(KanbanColumn);

// Item

const boxSource = {
  beginDrag(props) {
    return {
      name: props.id,
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult) {
      props.onDrop(monitor.getItem().name, dropResult.name);
    }
  },
};

class KanbanItem extends React.Component {
  render() {
    return this.props.connectDragSource(<div>{this.props.children}</div>);
  }
}

KanbanItem = DragSource("kanbanItem", boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(KanbanItem);

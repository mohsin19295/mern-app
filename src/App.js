import './App.css';
import { useState, useEffect } from "react";
import axios from 'axios'
import { BiSortDown } from "react-icons/bi";
import { BiSortUp } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [state, setState] = useState({ name: "", age: "", city: "Delhi" });
  const [list, setList] = useState([]);
  const [display, setDisplay] = useState("Hide Form");
  const [displayForm, setDisplayForm] = useState(false);
  const [order, setOrder] = useState("asc"); // Initial state of order

  // ! Form display and hide
  const formDisplay = () => {
    setDisplay(displayForm ? "Hide Form" : "Show Form");
    setDisplayForm((current) => !current);
  };

  //! Form setup, handler and route
  const { name, age, city } = state; // To set value for input fields and reset fields to null

  // Handeling multiple onChange together for input
  const onInputChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  // Adding data via Form
  const handleClick = (e) => {
    e.preventDefault();
    axios
      .post("https://mohsin-mern-app.herokuapp.com/", state)
      .then(() => {
        setState({ name: "", age: "", city: "" });
        setList([...list, { name, age, city }]); // Avoiding to create funtion getData and useEffect seperately then call here for displaying data at the same time
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  //! To check all data in /list route
  useEffect(() => {
    axios
      .get("https://mohsin-mern-app.herokuapp.com/list")
      .then((res) => {
        setList(res.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  //! Table handling for sorting data
  const sorting = (arg) => {
    // Here arg === name || age || city
    if (order === "asc") {
      const sorted = list.sort((a, b) => {
        return a[arg] > b[arg] ? 1 : -1;
      });
      setList(sorted); // If order === 'asc' then passing sorted data into setList
      setOrder("des"); // Finally, change the state of order
    }
    if (order === "des") {
      const sorted = list.sort((a, b) => {
        return a[arg] < b[arg] ? 1 : -1;
      });
      setList(sorted);
      setOrder("asc");
    }
  };

  // Handeling Icon with respect to it's order (ascending or descending)
  const handleSortIcon = (order) =>
    order === "asc" ? <BiSortUp /> : <BiSortDown />;

  //! Update and delete handler
  const updateField = (id) => {
    const newName = prompt("Enter new name:");
    const newAge = prompt("Enter new age:");
    const newCity = prompt("Enter new city:");
    axios
      .put("https://mohsin-mern-app.herokuapp.com/update", { newName, newAge, newCity, id }) // we are updating newAge and id in the backend so put only these two
      .then(() =>
        setList(
          list.map((e) =>
            // First check, if the id are same or not, then update required field (While updating, if we don't need to update any specific value, then set field as it is like{city: e.city} else set it to newValue like {city : newCity} with the help of ternary operator) and same do in server-side also
            e._id === id
              ? {
                  _id: id,
                  name: newName ? newName : e.name,
                  city: newCity ? newCity : e.city,
                  age: newAge ? newAge : e.age,
                }
              : e
          )
        )
      );
  };

  const deleteField = (id) => {
    axios
      .delete(`https://mohsin-mern-app.herokuapp.com/delete/${id}`)
      .then(() => setList(list.filter((e) => e._id !== id)));
  };

  return (
    <div className="App">
      <h1>MERN App</h1>
      {!displayForm && (
        <form onSubmit={handleClick}>
          <input
            type="text"
            placeholder="enter name"
            name="name"
            value={name}
            onChange={onInputChange}
          />
          <input
            type="number"
            placeholder="enter age"
            name="age"
            value={age}
            onChange={onInputChange}
          />
          <input
            type="text"
            placeholder="enter city"
            value={city}
            name="city"
            onChange={onInputChange}
          />
          <button>Submit Data</button>
        </form>
      )}

      <button
        onClick={(e) => {
          formDisplay(e);
        }}
      >
        {display}
      </button>
      <div className="display-data">
        <table border="1">
          <thead>
            <tr>
              <th
                onClick={() => {
                  sorting("name");
                }}
              >
                Name {handleSortIcon(order)}
              </th>
              <th
                onClick={() => {
                  sorting("age");
                }}
              >
                Age {handleSortIcon(order)}
              </th>
              <th
                onClick={() => {
                  sorting("city");
                }}
              >
                City {handleSortIcon(order)}
              </th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          {list.map((e) => (
            <tbody key={uuidv4()}>
              <tr>
                <td>{e.name}</td>
                <td>{e.age}</td>
                <td>{e.city}</td>
                <td
                  style={{ textAlign: "center" }}
                  onClick={() => {
                    updateField(e._id);
                  }}
                >
                  {<FaEdit />}
                </td>
                <td
                  style={{ textAlign: "center" }}
                  onClick={() => {
                    deleteField(e._id);
                  }}
                >
                  {<AiFillDelete />}
                </td>
              </tr>
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

export default App;

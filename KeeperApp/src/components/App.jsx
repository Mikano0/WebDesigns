import React, { useState } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Note from "./Note.jsx";
import CreateArea from "./CreateArea";

function createEntry(note) {
	return <Note key={note.key} title={note.title} body={note.body} />;
}

function App() {
	const [items, setItems] = useState([]);

	// function addItem(newNote) {
	// 	setItems((prevItems) => {
	// 		return [...prevItems, newNote];
	// 	});
	// }'

	// For the function below this is the other syntax.
	//titleText, bodyText
	// 	{
	// 	title: titleText,
	// 	body: bodyText,
	// },

	function addItem(newNote) {
		setItems((prevItems) => {
			return [...prevItems, newNote];
		});
	}

	function deleteItem(id) {
		setItems((prevItems) => {
			return prevItems.filter((item, index) => {
				return index !== id;
			});
		});
	}

	return (
		<div>
			<Header />
			<CreateArea onAdd={addItem} />
			{items.map((note, index) => (
				<Note
					key={index}
					id={index}
					title={note.title}
					content={note.body}
					onDelete={deleteItem}
				/>
			))}
			<Footer />
		</div>
	);
}

export default App;

import React, { useState } from "react";
import { Add, ZoomIn } from "@mui/icons-material";
import { Fab } from "@mui/material";
import Zoom from "@mui/material/Zoom";

function CreateArea(props) {
	// const [title, setTitle] = useState("");
	// const [body, setBody] = useState("");

	// function handleChange(event) {
	// 	const { name, value } = event.target;
	// 	if (name === "title") {
	// 		setTitle(value);
	// 	} else if (name === "body") {
	// 		setBody(value);
	// 	}
	// }

	// function submitNote(event) {
	// 	event.preventDefault();

	// 	props.onAdd(title, body);
	// 	setTitle("");
	// 	setBody("");
	// }

	const [note, setNote] = useState({
		title: "",
		body: "",
	});
	const [isZoomed, setIsZoomed] = useState(false);

	function handleZoom() {
		setIsZoomed(true);
	}

	function handleChange(event) {
		const { name, value } = event.target;

		setNote((prevNote) => {
			return {
				...prevNote,
				[name]: value,
			};
		});
	}

	function submitNote(event) {
		event.preventDefault();
		props.onAdd(note);
		setNote({
			title: "",
			body: "",
		});
	}

	return (
		<div onClick={handleZoom}>
			<form className="create-note" onSubmit={submitNote}>
				<input
					onChange={handleChange}
					name="title"
					placeholder="Title"
					value={note.title}
					//{title}
				/>
				<Zoom in={isZoomed}>
					<div>
						<textarea
							onChange={handleChange}
							name="body"
							placeholder="Take a note..."
							value={note.body}
							//{body}
							rows={isZoomed ? 3 : 1}
						/>

						<Fab type="submit">
							<Add />
						</Fab>
					</div>
				</Zoom>
			</form>
		</div>
	);
}

export default CreateArea;

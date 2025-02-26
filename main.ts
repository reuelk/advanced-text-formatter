import { Editor, Plugin } from 'obsidian';

export default class TextProcessor extends Plugin {

	statusBarTextElement: HTMLSpanElement;

	async onload() {
		console.log('Loaded plugin.');
		
		this.statusBarTextElement = this.addStatusBarItem().createEl('span');
		this.readActiveFileAndUpdateLineCount();

		this.app.workspace.on('active-leaf-change', async () => {  // this calls the enclosure when the active-leaf-change event is triggered

			this.readActiveFileAndUpdateLineCount();
		})

		this.app.workspace.on('editor-change', editor => {  // triggered when the editor is changed.
			const content = editor.getDoc().getValue();
			this.updateLineCount(content);
		})

		this.addCommand({
			id: 'remove-line-breaks',
			name: 'Remove Line Breaks',
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				const splitByParagraph = selection.split("\n")
				
				let lineBreaksRemoved = "";
				//console.log(splitByParagraph);

				splitByParagraph.forEach((chunk, index) => {
					const nextIndex = index + 1;
					
					if (chunk !== "") { // Chunk contains text
						if (index == 0) {
							lineBreaksRemoved = chunk;
						} else if (splitByParagraph[index-1] == "") {
							lineBreaksRemoved = lineBreaksRemoved + chunk;
						} else {
							//TODO: check if the last character is a -, if it is, don't add a space.

							lineBreaksRemoved = lineBreaksRemoved + " " + chunk;
						}
					} else { // Chunk does not contain text
						if (index + 1 !== splitByParagraph.length && splitByParagraph[index+1] !== "") { // This is not the last chunk
							lineBreaksRemoved = lineBreaksRemoved + "\n\n";
						}
					}

				});

				

				//const lineBreaksRemoved = selection.replace(/\n/g," ");

				editor.replaceSelection(lineBreaksRemoved);
			},
		});
		
	}

	async onunload() {
		console.log('Unloaded plugin.')
	}

	// -- FUNCTIONS --

	private updateLineCount(fileContent?: string) {
		const count = fileContent ? fileContent.split(/\r\n|\r|\n/).length : 0;  // splits the file contents into an array using carriage returns and then counts the number of entities in the array
		const linesWord = count === 1 ? "line" : "lines";
		this.statusBarTextElement.textContent = `${count} ${linesWord}`;

	}

	private async readActiveFileAndUpdateLineCount() {
		const file = this.app.workspace.getActiveFile();
		if (file) {
			const content = await this.app.vault.read(file);  // this promises something, which means it accesses it asynchronously. This method thus needs to happen asynchronously.
			this.updateLineCount(content);
		} else {
			this.updateLineCount(undefined);
		}
	}
}
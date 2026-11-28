import * as stylex from '@stylexjs/stylex';
import { ChevronLeft, Copy, FileText, Plus, Share, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../controls/button';
import { Callout } from '../controls/callout';
import type { ChangeEvent } from 'react';
import type { Character } from '../../models/character';
import { ConfirmButton } from '../controls/confirm-button';
import { Divider } from '../controls/divider';
import { JinxList } from '../panels/jinx-list';
import { ListPicker } from '../controls/list-picker';
import type { Script } from '../../models/script';
import { ScriptLogic } from '../../logic/script-logic';
import { ScriptSheet } from '../panels/script-sheet';
import { ScriptType } from '../../enums/script-type';
import { Segmented } from '../controls/segmented';
import { Spacer } from '../controls/spacer';
import { Tag } from '../controls/tag';
import { Text } from '../controls/text';
import { TextBox } from '../controls/textbox';
import { Utility } from '../../utils/utility';
import { palette } from '../../tokens.stylex';

interface Props {
	homebrew: Script[];
	onHomebrewChange: (homebrew: Script[]) => void;
	onCancel: () => void;
}

const styles = stylex.create({
	browsePage: {
		height: '100%',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		padding: '20px',
		backgroundColor: palette.background,
		color: palette.text
	},
	header: {
		backgroundColor: palette.backgroundDark,
		marginBottom: '20px',
		padding: '10px',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	body: {
		display: 'flex',
		flexDirection: 'row',
		flex: '1 1 0',
		minHeight: 0,
		gap: '20px'
	},
	list: {
		width: '250px',
		flexShrink: 0,
		overflowY: 'auto'
	},
	detail: {
		flex: '1 1 0',
		minWidth: 0,
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	},
	detailHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '10px'
	},
	grow: {
		flex: '1 1 0',
		minWidth: 0
	},
	columns: {
		display: 'flex',
		flexDirection: 'row',
		flex: '1 1 0',
		minHeight: 0,
		gap: '10px'
	},
	column: {
		flex: '1 1 0',
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '10px'
	}
});

export const BrowsePage = (props: Props) => {
	const [ selectedID, setSelectedID ] = useState<string | null>(null);
	// Scripts open for browsing; only a homebrew script can be switched to editing
	const [ editing, setEditing ] = useState<boolean>(false);
	const [ importMessage, setImportMessage ] = useState<{ type: 'warning' | 'error', text: string } | null>(null);
	const fileInput = useRef<HTMLInputElement>(null);

	const builtIn = ScriptLogic.getBuiltInScripts();
	const script = ScriptLogic.findScript(props.homebrew, selectedID);

	const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[ 0 ];
		// Clear it, so picking the same file again still triggers a change
		event.target.value = '';
		if (file) {
			await importFile(file);
		}
	};

	// A script file picked, or dropped onto the page from Files
	const importFile = async (file: File) => {
		const result = ScriptLogic.importJSON(file.name, await file.text());
		if (result.script) {
			onAdd(result.script, false);
		}
		setImportMessage(result.message);
	};

	const onSelect = (id: string, edit: boolean = false) => {
		setSelectedID(id);
		setEditing(edit);
		setImportMessage(null);
	};

	const onAdd = (h: Script, edit: boolean) => {
		props.onHomebrewChange([ ...props.homebrew, h ]);
		onSelect(h.id, edit);
	};

	const onUpdate = (h: Script) => {
		props.onHomebrewChange(ScriptLogic.updateHomebrew(props.homebrew, h));
	};

	const onDelete = (id: string) => {
		props.onHomebrewChange(ScriptLogic.removeHomebrew(props.homebrew, id));
		setSelectedID(null);
		setEditing(false);
	};

	const getScriptCharacters = (s: Script, onRemove?: (c: Character) => void, scope?: Character[]) => {
		// Only the editor compares the counts with the suggested numbers
		return (
			<ScriptSheet
				characters={ScriptLogic.getCharacters(s)}
				roles={ScriptLogic.scriptRoles}
				getNote={(r, count) => onRemove ? ScriptLogic.getCountLabel(s.type, r, count) : `${count}`}
				isError={(r, count) => !!onRemove && ScriptLogic.isOverSuggested(s.type, r, count)}
				action={onRemove ? 'included' : undefined}
				onClick={onRemove}
				monogramScope={scope}
			/>
		);
	};

	const getAlmanacLink = (s: Script) => {
		const url = ScriptLogic.getAlmanacLink(s);
		return url ? <a href={url} target='_blank' rel='noopener noreferrer'>Almanac</a> : null;
	};

	const onExport = (s: Script) => {
		const file = ScriptLogic.getExport(s);
		void Utility.share(file.filename, file.json, 'application/json');
	};

	// Loaded on first use, so the PDF code isn't part of starting the app
	const onExportPDF = async (s: Script) => {
		const { ScriptPDFLogic } = await import('../../logic/script-pdf-logic');
		const file = ScriptPDFLogic.getExport(s);
		await Utility.share(file.filename, file.bytes, 'application/pdf');
	};

	const getScriptDetail = (s: Script) => {
		return (
			<div {...stylex.props(styles.detail)}>
				<div {...stylex.props(styles.detailHeader)}>
					<Spacer orientation='horizontal'>
						<Text type='h2'>{s.name}</Text>
						<Tag>{s.type}</Tag>
						{s.author ? <Tag>by {s.author}</Tag> : null}
						{getAlmanacLink(s)}
					</Spacer>
					<Spacer orientation='horizontal'>
						<Button icon={Share} label='Share' onClick={() => onExport(s)} />
						<Button icon={FileText} label='PDF' onClick={() => void onExportPDF(s)} />
						<Button icon={Copy} label='Copy as homebrew' onClick={() => onAdd(ScriptLogic.copyAsHomebrew(s), true)} />
						{s.isHomebrew ? <Button type='primary' label='Edit' onClick={() => setEditing(true)} /> : null}
					</Spacer>
				</div>
				<Divider />
				<div {...stylex.props(styles.column)}>
					<JinxList characters={ScriptLogic.getCharacters(s)} />
					{getScriptCharacters(s)}
				</div>
			</div>
		);
	};

	const getScriptEditor = (h: Script) => {
		const available = ScriptLogic.getAddableCharacters(h);

		const onAddCharacter = (c: Character) => onUpdate(ScriptLogic.addCharacter(h, c.id));
		const onRemoveCharacter = (c: Character) => onUpdate(ScriptLogic.removeCharacter(h, c.id));

		return (
			<div {...stylex.props(styles.detail)}>
				<div {...stylex.props(styles.detailHeader)}>
					<div {...stylex.props(styles.grow)}>
						<Text>Name</Text>
						<TextBox value={h.name} placeholder='Script name' maxLength={50} onChange={name => onUpdate({ ...h, name: name })} />
					</div>
					<div>
						<Text>Type</Text>
						<Segmented
							options={Object.values(ScriptType).map(t => ({ id: t, label: t }))}
							selectedID={h.type}
							onChange={id => onUpdate({ ...h, type: id as ScriptType })}
						/>
					</div>
					<ConfirmButton key={h.id} label='Delete' confirmLabel='Delete script' onConfirm={() => onDelete(h.id)} />
					<Button type='primary' label='Done' onClick={() => setEditing(false)} />
				</div>
				<div {...stylex.props(styles.detailHeader)}>
					<div {...stylex.props(styles.grow)}>
						<Text>Author</Text>
						<TextBox value={h.author ?? ''} placeholder='Who wrote it' maxLength={50} onChange={author => onUpdate({ ...h, author: author })} />
					</div>
					<div {...stylex.props(styles.grow)}>
						<Text>Almanac URL</Text>
						<TextBox value={h.almanac ?? ''} placeholder='https://' maxLength={250} onChange={almanac => onUpdate({ ...h, almanac: almanac })} />
					</div>
				</div>
				<Divider />
				<div {...stylex.props(styles.columns)}>
					<div {...stylex.props(styles.column)}>
						<Text type='h3'>Add characters</Text>
						<ScriptSheet
							characters={available}
							roles={ScriptLogic.scriptRoles}
							action='add'
							onClick={onAddCharacter}
							monogramScope={[ ...ScriptLogic.getCharacters(h), ...available ]}
						/>
					</div>
					<div {...stylex.props(styles.column)}>
						<Text type='h3'>On this script</Text>
						{getScriptCharacters(h, onRemoveCharacter)}
						<JinxList characters={ScriptLogic.getCharacters(h)} />
					</div>
				</div>
			</div>
		);
	};

	return (
		<div
			{...stylex.props(styles.browsePage)}
			onDragOver={e => {
				if (e.dataTransfer.types.includes('Files')) {
					e.preventDefault();
				}
			}}
			onDrop={e => {
				const file = e.dataTransfer.files[ 0 ];
				if (file) {
					e.preventDefault();
					void importFile(file);
				}
			}}
		>
			<div {...stylex.props(styles.header)}>
				<Text type='h1'>Browse Scripts</Text>
				<Button type='quiet' icon={ChevronLeft} label='Back' onClick={props.onCancel} />
			</div>
			<div {...stylex.props(styles.body)}>
				<div {...stylex.props(styles.list)}>
					<Spacer>
						<Text type='h3'>Official Scripts</Text>
						<ListPicker
							options={
								builtIn.map(s => ({
									id: s.id,
									label: (
										<Spacer>
											<Text>{s.name}</Text>
											<Text type='dimmed'>{s.author}</Text>
											<Text type='dimmed'>{s.type}</Text>
										</Spacer>
									)
								}))
							}
							selectedID={selectedID}
							onChange={onSelect}
						/>
						<Text type='h3'>Homebrew Scripts</Text>
						{
							props.homebrew.length > 0 ?
								<ListPicker options={props.homebrew.map(h => ({ id: h.id, label: h.name || 'Unnamed script' }))} selectedID={selectedID} onChange={id => onSelect(id)} />
								:
								<Text type='dimmed'>No homebrew scripts yet</Text>
						}
						<Divider />
						<Button icon={Plus} label='New script' onClick={() => onAdd(ScriptLogic.createHomebrew(), true)} />
						<Button icon={Upload} label='Import JSON' onClick={() => fileInput.current?.click()} />
						<input ref={fileInput} type='file' accept='.json,application/json' hidden={true} onChange={e => void onImport(e)} />
					</Spacer>
				</div>
				<div {...stylex.props(styles.detail)}>
					{importMessage ? <Callout type={importMessage.type}>{importMessage.text}</Callout> : null}
					{
						script ?
							(
								script.isHomebrew && editing ?
									getScriptEditor(script)
									:
									getScriptDetail(script)
							)
							:
							<Text type='dimmed'>Select a script to view it</Text>
					}
				</div>
			</div>
		</div>
	);
};

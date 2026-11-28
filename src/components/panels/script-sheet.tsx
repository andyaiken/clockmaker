import * as stylex from '@stylexjs/stylex';
import type { Character } from '../../models/character';
import { CharacterLogic } from '../../logic/character-logic';
import { CharacterRow } from './character-row';
import type { RoleType } from '../../enums/role-type';
import { palette } from '../../tokens.stylex';
import { useMemo } from 'react';

interface Props {
	characters: Character[];
	// The role groups to show, in order; a group with no characters is left out unless it has a heading note
	roles: RoleType[];
	// Extra text beside a group's heading, eg '13 of 13'
	getNote?: (role: RoleType, count: number) => string | null;
	// Shows a group's heading as an error, eg when it has too many characters
	isError?: (role: RoleType, count: number) => boolean;
	action?: 'add' | 'included';
	onClick?: (character: Character) => void;
	// Characters these monograms should avoid clashing with, eg the rest of the script; defaults to these characters
	monogramScope?: Character[];
}

const styles = stylex.create({
	sheet: {
		display: 'flex',
		flexDirection: 'column',
		gap: '18px'
	},
	group: {
		display: 'flex',
		flexDirection: 'column',
		gap: '2px'
	},
	heading: {
		display: 'flex',
		alignItems: 'baseline',
		gap: '10px',
		padding: '0 10px 4px 10px',
		borderBottomWidth: '1px',
		borderBottomStyle: 'solid',
		borderBottomColor: palette.controlBorder,
		marginBottom: '4px'
	},
	title: {
		fontSize: '13px',
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: '0.06em',
		color: palette.textDimmed
	},
	note: {
		fontSize: '13px',
		color: palette.textDimmed
	},
	error: {
		color: palette.textError
	},
	// Two columns when there's room, so a whole script fits on one screen
	rows: {
		columns: '2 300px',
		columnGap: '16px'
	}
});

// A script read like a script sheet: one row per character, grouped by role
export const ScriptSheet = (props: Props) => {
	const scope = props.monogramScope ?? props.characters;
	const monograms = useMemo(() => CharacterLogic.getMonograms(scope), [ scope ]);

	return (
		<div {...stylex.props(styles.sheet)}>
			{
				props.roles.map(role => {
					const list = CharacterLogic.filterByRole(props.characters, role);
					const note = props.getNote ? props.getNote(role, list.length) : null;
					if ((list.length === 0) && !note) {
						return null;
					}
					const error = props.isError ? props.isError(role, list.length) : false;
					return (
						<section key={role} {...stylex.props(styles.group)}>
							<div {...stylex.props(styles.heading)}>
								<span {...stylex.props(styles.title, error && styles.error)}>{CharacterLogic.getPlural(role)}</span>
								{note ? <span {...stylex.props(styles.note, error && styles.error)}>{note}</span> : null}
							</div>
							<div {...stylex.props(styles.rows)}>
								{
									list.map(c => (
										<CharacterRow
											key={c.id}
											character={c}
											monogram={monograms.get(c.id) ?? CharacterLogic.getMonogram(c.name)}
											action={props.action ?? null}
											onClick={props.onClick ? () => props.onClick?.(c) : undefined}
										/>
									))
								}
							</div>
						</section>
					);
				})
			}
		</div>
	);
};

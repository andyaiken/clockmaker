import * as stylex from '@stylexjs/stylex';
import { HelpContent, type HelpTopic } from '../../data/help';
import { useRef, useState } from 'react';
import { Button } from '../controls/button';
import { ChevronLeft } from 'lucide-react';
import { Text } from '../controls/text';
import { palette } from '../../tokens.stylex';

interface Props {
	onBack: () => void;
}

const styles = stylex.create({
	page: {
		height: '100%',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		padding: '12px 20px 0 20px',
		gap: '12px',
		backgroundColor: palette.background,
		color: palette.text
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px'
	},
	body: {
		flex: '1 1 0',
		minHeight: 0,
		display: 'flex',
		gap: '24px'
	},
	nav: {
		width: '220px',
		flexShrink: 0,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '2px',
		paddingBottom: '20px'
	},
	navItem: {
		appearance: 'none',
		margin: 0,
		minHeight: '44px',
		padding: '6px 12px',
		borderWidth: 0,
		borderRadius: '10px',
		backgroundColor: {
			'default': 'transparent',
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.text,
		fontFamily: 'inherit',
		fontSize: '16px',
		textAlign: 'left',
		cursor: 'pointer',
		outline: {
			'default': 'none',
			':focus-visible': `2px solid ${palette.controlBorderHighlight}`
		}
	},
	navSelected: {
		backgroundColor: {
			'default': palette.controlFaceHighlight,
			':hover': { 'default': null, '@media (hover: hover)': palette.controlFaceHighlight }
		},
		color: palette.textHighlight,
		fontWeight: '600'
	},
	content: {
		flex: '1 1 0',
		minWidth: 0,
		overflowY: 'auto',
		// Room for the last section to scroll up to the top
		paddingBottom: '50vh',
		display: 'flex',
		flexDirection: 'column',
		gap: '36px'
	},
	section: {
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
		scrollMarginTop: '8px'
	},
	intro: {
		fontSize: '17px',
		lineHeight: 1.45,
		color: palette.textDimmed,
		maxWidth: '760px'
	},
	topic: {
		display: 'grid',
		gridTemplateColumns: 'minmax(260px, 1fr) minmax(0, 1.2fr)',
		gap: '20px',
		alignItems: 'start',
		padding: '18px',
		borderRadius: '16px',
		backgroundColor: palette.controlFace
	},
	topicNoImage: {
		gridTemplateColumns: '1fr'
	},
	topicText: {
		display: 'flex',
		flexDirection: 'column',
		gap: '10px',
		fontSize: '15px',
		lineHeight: 1.5
	},
	list: {
		margin: 0,
		paddingLeft: '20px',
		display: 'flex',
		flexDirection: 'column',
		gap: '6px'
	},
	tips: {
		color: palette.textDimmed
	},
	screenshotButton: {
		appearance: 'none',
		margin: 0,
		padding: 0,
		borderWidth: 0,
		backgroundColor: 'transparent',
		cursor: 'zoom-in',
		outline: {
			'default': 'none',
			':focus-visible': `3px solid ${palette.controlBorderHighlight}`
		},
		borderRadius: '10px'
	},
	// A screenshot opened full size
	enlarged: {
		position: 'fixed',
		inset: 0,
		zIndex: 100,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '24px',
		backgroundColor: 'rgb(0 0 0 / 0.7)',
		cursor: 'zoom-out'
	},
	enlargedImage: {
		maxWidth: '100%',
		maxHeight: '100%',
		borderRadius: '12px',
		boxShadow: '0 20px 60px rgb(0 0 0 / 0.4)'
	},
	screenshot: {
		display: 'block',
		width: '100%',
		height: 'auto',
		borderRadius: '10px',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: palette.controlBorder,
		boxShadow: '0 6px 20px rgb(0 0 0 / 0.12)'
	}
});

// Screenshots are optional: a topic whose picture is missing just shows its text
// Tapping one opens it full size; tapping again closes it
const Screenshot = (props: { id: string, alt: string }) => {
	const [ failed, setFailed ] = useState(false);
	const [ enlarged, setEnlarged ] = useState(false);
	const src = `${import.meta.env.BASE_URL}help/${props.id}.jpg`;
	if (failed) {
		return null;
	}
	return (
		<>
			<button type='button' aria-label={`${props.alt}: show full size`} {...stylex.props(styles.screenshotButton)} onClick={() => setEnlarged(true)}>
				<img src={src} alt={props.alt} {...stylex.props(styles.screenshot)} onError={() => setFailed(true)} />
			</button>
			{
				enlarged ?
					<div role='dialog' aria-label={props.alt} {...stylex.props(styles.enlarged)} onClick={() => setEnlarged(false)}>
						<img src={src} alt={props.alt} {...stylex.props(styles.enlargedImage)} />
					</div>
					: null
			}
		</>
	);
};

// How to use everything in the app, especially the things that are hard to discover, like holding a seat or ink
export const HelpPage = (props: Props) => {
	const [ selected, setSelected ] = useState(HelpContent[ 0 ].id);
	const contentRef = useRef<HTMLDivElement>(null);

	const goTo = (id: string) => {
		setSelected(id);
		const section = document.getElementById(`help-${id}`);
		const content = contentRef.current;
		if (section && content) {
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			// Smooth scrolling ignores a target past the end, so keep it in range
			const target = content.scrollTop + section.getBoundingClientRect().top - content.getBoundingClientRect().top - 8;
			const top = Math.round(Math.min(target, content.scrollHeight - content.clientHeight));
			content.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
		}
	};

	// Keep the list in step with the section being read
	const onScroll = () => {
		const top = contentRef.current?.getBoundingClientRect().top ?? 0;
		const current = HelpContent.filter(s => (document.getElementById(`help-${s.id}`)?.getBoundingClientRect().top ?? 0) - top < 120).pop();
		if (current && (current.id !== selected)) {
			setSelected(current.id);
		}
	};

	const getTopic = (topic: HelpTopic) => (
		<article key={topic.id} {...stylex.props(styles.topic, !topic.screenshot && styles.topicNoImage)}>
			<div {...stylex.props(styles.topicText)}>
				<Text type='h3'>{topic.title}</Text>
				<div>{topic.summary}</div>
				{topic.steps ? <ul {...stylex.props(styles.list)}>{topic.steps.map(s => <li key={s}>{s}</li>)}</ul> : null}
				{topic.tips ? <ul {...stylex.props(styles.list, styles.tips)}>{topic.tips.map(s => <li key={s}>{s}</li>)}</ul> : null}
			</div>
			{topic.screenshot ? <Screenshot id={topic.screenshot} alt={topic.title} /> : null}
		</article>
	);

	return (
		<div {...stylex.props(styles.page)}>
			<div {...stylex.props(styles.header)}>
				<Button type='quiet' icon={ChevronLeft} label='Back' onClick={props.onBack} />
				<Text type='h1'>Help</Text>
			</div>
			<div {...stylex.props(styles.body)}>
				<nav aria-label='Help sections' {...stylex.props(styles.nav)}>
					{
						HelpContent.map(s => (
							<button
								key={s.id}
								type='button'
								aria-current={selected === s.id ? 'true' : undefined}
								{...stylex.props(styles.navItem, selected === s.id && styles.navSelected)}
								onClick={() => goTo(s.id)}
							>
								{s.title}
							</button>
						))
					}
				</nav>
				<div ref={contentRef} {...stylex.props(styles.content)} onScroll={onScroll}>
					{
						HelpContent.map(s => (
							<section key={s.id} id={`help-${s.id}`} {...stylex.props(styles.section)}>
								<Text type='h1'>{s.title}</Text>
								<div {...stylex.props(styles.intro)}>{s.intro}</div>
								{s.topics.map(getTopic)}
							</section>
						))
					}
				</div>
			</div>
		</div>
	);
};

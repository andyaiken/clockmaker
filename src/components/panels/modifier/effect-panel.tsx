import { BelievesTheyAreEffect } from './effects/believes-they-are-effect';
import { CanRegisterAsEffect } from './effects/can-register-as-effect';
import type { Effect } from '../../../models/effect';
import { EffectType } from '../../../enums/effect-type';
import { HasTheAbilityOfEffect } from './effects/has-the-ability-of-effect';
import { HasVoteModifiedEffect } from './effects/has-vote-modified-effect';
import { HasWinConditionEffect } from './effects/has-win-condition-effect';
import { IsDrunkEffect } from './effects/is-drunk-effect';
import { IsPoisonedEffect } from './effects/is-poisoned-effect';
import { IsProtectedEffect } from './effects/is-protected-effect';
import { IsWokenEffect } from './effects/is-woken-effect';

interface Props {
	effect: Effect;
}

// One thing a player modifier does to the player it's on; each effect type has its own renderer
export const EffectPanel = (props: Props) => {
	const effect = props.effect;
	switch (effect.type) {
		case EffectType.BelievesTheyAre:
			return <BelievesTheyAreEffect effect={effect} />;
		case EffectType.CanRegisterAs:
			return <CanRegisterAsEffect effect={effect} />;
		case EffectType.HasTheAbilityOf:
			return <HasTheAbilityOfEffect effect={effect} />;
		case EffectType.IsDrunk:
			return <IsDrunkEffect effect={effect} />;
		case EffectType.IsPoisoned:
			return <IsPoisonedEffect effect={effect} />;
		case EffectType.IsProtected:
			return <IsProtectedEffect effect={effect} />;
		case EffectType.HasVoteModified:
			return <HasVoteModifiedEffect effect={effect} />;
		case EffectType.HasWinCondition:
			return <HasWinConditionEffect effect={effect} />;
		case EffectType.IsWoken:
			return <IsWokenEffect effect={effect} />;
	}
};

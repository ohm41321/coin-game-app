// components/EventCardView.tsx
import React from 'react';
import { EventCard, EventEffect } from '../lib/types';
import styles from './EventCardView.module.css';
import { useTranslation } from 'react-i18next';

interface EventCardViewProps {
  event: EventCard;
}

// Helper to get an icon based on the event
const getIconForEvent = (effect: EventEffect): string => {
  switch (effect.type) {
    case 'COIN_CHANGE':
      if (effect.category === 'total') return effect.value > 0 ? '💰' : '💸';
      return '💔';
    case 'RULE_CHANGE':
      return '⚖️';
    case 'INCOME_BOOST':
      return '📈';
    case 'WAIVE_FOOD_COST':
      return '🎉';
    default:
      return '🎲';
  }
};


const EventCardView: React.FC<EventCardViewProps> = ({ event }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div className={styles.card}>
      <div className={styles.banner}>
        EVENT
      </div>
      <div className={styles.content}>
        <div className={styles.icon}>{getIconForEvent(event.effect)}</div>
        <h3 className={styles.title}>{event.title[currentLang] || event.title.en}</h3>
        <p className={styles.description}>{event.description[currentLang] || event.description.en}</p>
      </div>
    </div>
  );
};

export default EventCardView;
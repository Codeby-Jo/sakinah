import React from 'react';
import type { ConversationTopic } from '../types/sakinah.types';

interface ConversationTopicListProps {
  topics: ConversationTopic[];
  className?: string;
}

export const ConversationTopicList: React.FC<ConversationTopicListProps> = ({ topics, className = '' }) => {
  return (
    <div className={`sk-curriculum ${className}`}>
      <div className="ck">Pre-nikah topics · unlock as trust builds</div>
      
      {topics.map((t, i) => {
        const isExplored = t.isUnlocked && i < topics.findIndex(top => top.id === 't3'); // Just mock logic for 'Explored'
        const isNow = t.id === 't3' || (t.isUnlocked && !isExplored);
        
        let itemClass = 'topic-line';
        let ti = String(i + 1);
        let st = 'Locked';

        if (isExplored) {
          itemClass += ' open';
          ti = '✓';
          st = 'Explored';
        } else if (isNow) {
          itemClass += ' now';
          ti = '●';
          st = 'Now';
        }

        return (
          <div key={t.id} className={itemClass}>
            <div className="ti">{ti}</div>
            {t.title}
            <span className="st">{st}</span>
          </div>
        );
      })}
      
      {/* Required intimacy boundary */}
      <div className="topic-line nikah">
        <div className="ti font-serif text-[18px]">۩</div>
        Intimacy & Closeness
        <span className="st">After nikah</span>
      </div>
    </div>
  );
};

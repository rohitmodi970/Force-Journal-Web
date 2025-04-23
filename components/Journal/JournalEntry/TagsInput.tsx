import React from 'react';
import { X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface TagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  styles: any;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  setTags,
  newTag,
  setNewTag,
  styles
}) => {
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-wrap gap-2 flex-1">
        {tags.map(tag => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: styles.primaryLight,
              color: styles.primaryColor
            }}
          >
            <span>#{tag}</span>
            <button 
              onClick={() => removeTag(tag)}
              className="ml-2 p-1 rounded-full hover:bg-opacity-20"
              aria-label={`Remove tag ${tag}`}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tag"
          className="px-3 py-1 rounded-lg transition-all duration-300"
          style={{
            backgroundColor: styles.bgInput,
            color: styles.textPrimary,
            border: `1px solid ${styles.borderColor}`
          }}
          aria-label="Add new tag"
        />
        <motion.button
          onClick={handleAddTag}
          className="p-2 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ backgroundColor: styles.primaryLight }}
          aria-label="Confirm tag addition"
        >
          <Plus size={18} style={{ color: styles.primaryColor }} />
        </motion.button>
      </div>
    </div>
  );
};

export default TagsInput;
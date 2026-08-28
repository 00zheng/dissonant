import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { Track } from '../../types';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackId: string, data: Partial<Track>) => void;
  track: Track | null;
}

export const TrackModal: React.FC<TrackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  track,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [versionTag, setVersionTag] = useState('');
  const [bpm, setBpm] = useState<number>(120);
  const [key, setKey] = useState('C');

  useEffect(() => {
    if (track) {
      setTitle(track.title);
      setArtist(track.artist);
      setVersionTag(track.versionTag || 'v1.0 Final');
      setBpm(track.bpm || 120);
      setKey(track.key || 'C');
    }
  }, [track, isOpen]);

  if (!track) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(track.id, {
      title: title.trim(),
      artist: artist.trim(),
      versionTag: versionTag.trim(),
      bpm: Number(bpm) || 120,
      key: key.trim(),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Track Details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Track Title
          </label>
          <Input
            placeholder="Track Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
            Artist / Performer
          </label>
          <Input
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
              Version Tag
            </label>
            <Input
              placeholder="v1.0 Master"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
              BPM
            </label>
            <Input
              type="number"
              placeholder="120"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E8BDB3]/80 uppercase tracking-wider mb-1.5">
              Key
            </label>
            <Input
              placeholder="Am"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#282828]">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" type="submit" disabled={!title.trim()}>
            Save Track Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

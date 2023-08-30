import {join} from 'path';
import {FileSystemConstructionEntry} from './testFileSystem';

export const testDirectory = './testdata';

export const illegalPaths = Object.freeze([
  '..',
  '../..',
  '/hello/../world/../..',
  './..',
  './../there.jpg',
]);

/* TEST FILESYSTEM FS1 */

export const fs1Files = {
  imagination: {
    name: 'imagination.txt',
    relativePath: 'TerryPratchett/imagination.txt',
    absolutePath: join(testDirectory, 'TerryPratchett/imagination.txt'),
    contents: 'Stories of imagination tend to upset those without one.',
  },
  motivcation: {
    name: 'motivation.txt',
    relativePath: 'TerryPratchett/motivation.txt',
    absolutePath: join(testDirectory, 'TerryPratchett/motivation.txt'),
    contents:
      "It's not worth doing something unless someone, somewhere, would much rather you weren't doing it.",
  },
  startingOver: {
    name: 'starting-over.txt',
    relativePath: 'TerryPratchett/starting-over.txt',
    absolutePath: join(testDirectory, 'TerryPratchett/starting-over.txt'),
    contents: 'Coming back to where you started is not the same as never leaving.',
  },
  future: {
    name: 'future.md',
    relativePath: 'FrankHerbert/future.md',
    absolutePath: join(testDirectory, '/FrankHerbert/future.md'),
    contents:
      'The concept of progress acts as a protective mechanism to shield us from the terrors of the future.',
  },
  openMind: {
    name: 'open-mind.md',
    relativePath: 'open-mind.md',
    absolutePath: join(testDirectory, 'open-mind.md'),
    contents:
      'The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.',
  },
  emptiness: {
    name: 'emptiness.txt',
    relativePath: '/emptiness.txt',
    absolutePath: join(testDirectory, 'emptiness.txt'),
    contents: '',
  },
};

export const fs1TestDirectoryContents: FileSystemConstructionEntry = {
  TerryPratchett: {
    'imagination.txt': fs1Files.imagination.contents,
    'motivation.txt': fs1Files.motivcation.contents,
    'starting-over.txt': fs1Files.startingOver.contents,
  },
  FrankHerbert: {
    'future.md': fs1Files.future.contents,
  },
  'open-mind.md': fs1Files.openMind.contents,
  '/emptiness.txt': fs1Files.emptiness.contents,
};

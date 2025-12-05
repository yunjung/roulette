class Options {
  useSkills: boolean = true;
  winningRank: number = 0;
  winningRanks: number[] = [0]; // Array of winning positions (0-indexed)
}

const options = new Options();
export default options;

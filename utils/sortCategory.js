const sortCategory = (category) => {
  const sortedCategory = category.children.sort((a, b) => a.name.localeCompare(b.name));
  const categoryPositions = [];

  for (let i = 0; i < sortedCategory.size; i += 1) {
    categoryPositions.push({ channel: sortedCategory.at(i).id, position: i });
  }

  category.guild.channels.setPositions(categoryPositions);
};

module.exports = sortCategory;

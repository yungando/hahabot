const sortCategory = (category) =>
{
    let sortedCategory = category.children.sort((a, b) => a.name.localeCompare(b.name));
    let categoryPositions = [];

    for (let i = 0; i < sortedCategory.size; i++)
    {
        categoryPositions.push({ channel: sortedCategory.at(i).id, position: i });
    }

    category.guild.channels.setPositions(categoryPositions);
}

module.exports = sortCategory;
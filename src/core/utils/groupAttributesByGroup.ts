export const groupAttributesByGroup = (attributes: any[]) => {
  return attributes.reduce((acc, attribute) => {
    if (!acc[attribute.Group]) {
      acc[attribute.Group] = [];
    }
    acc[attribute.Group].push(attribute);
    return acc;
  }, {} as Record<string, any[]>);
};

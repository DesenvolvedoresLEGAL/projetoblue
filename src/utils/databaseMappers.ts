// Minimal database mappers to replace deleted file
export const mapDatabaseAsset = (asset: any) => {
  return {
    uuid: asset.uuid,
    name: asset.radio || asset.line_number || asset.serial_number || 'N/A',
    type: asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT',
    status: asset.status || 'Unknown'
  };
};

export const mapDatabaseAssetToFrontend = (asset: any) => {
  return {
    ...asset,
    name: asset.radio || asset.line_number || asset.serial_number || 'N/A',
    type: asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT'
  };
};

export const mapStatusIdToAssetStatus = (statusId: number): string => {
  const statusMap: { [key: number]: string } = {
    1: 'DISPONÍVEL',
    2: 'ALUGADO', 
    3: 'MANUTENÇÃO',
    4: 'BLOQUEADO'
  };
  return statusMap[statusId] || 'Unknown';
};
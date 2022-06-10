local map_t = function(key, cmd)
  mapx('n', '<leader>t' .. key, 'Ultest' .. cmd)
end

map_t('f', '')
map_t('d', 'DebugNearest')
map_t('D', 'Debug')
map_t('h', 'Output')
map_t('n', 'Nearest')
map_t('s', 'Summary!')
map_t('x', 'StopNearest')
map_t('X', 'Stop')

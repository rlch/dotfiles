require('telescope').load_extension 'ghn'

require('github-notifications').setup {
  cache = false,
  debounce_duration = 30,
  hooks = {
    on_notification = function(notification)
      pcall(function()
        require 'notify'(notification.subject.title, 'info', {
          title = notification.subject.type,
          icon = '',
          timeout = 10000,
        })
      end)
    end,
  },
}

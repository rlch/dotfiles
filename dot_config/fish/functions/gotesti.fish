function gotesti --description 'gotestsum at the dir picked by walk'
    set -l loc (walk)
    gotestsum $loc/... $argv
end

function mini-umount --description 'Unmount the Mac mini sshfs share at ~/mnt/mini'
    set -l mp "$HOME/mnt/mini"
    if not mount | grep -q " on $mp "
        echo "mini-umount: nothing mounted at $mp"
        return 0
    end
    umount $mp
    or begin
        echo "mini-umount: lazy-unmounting (force)"
        diskutil unmount force $mp
    end
end

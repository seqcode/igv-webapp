head -438 index.html | tail -$((438-71+1)) > index_tmp.html
sed 's/nav class="navbar fixed-top/nav class="navbar/g' index_tmp.html > index_fixed_top_removed.html
tr -d '\n' < index_fixed_top_removed.html > index_lines_removed.html

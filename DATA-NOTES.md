# Things to check in the records data

These came up while converting the pasted lists. The site handles all of them, but you may want to fix the source.

## Automatically re-ordered (the site ranks by mark)
- **Boys triple jump**: Mike Reif (43-10.5) and Justin Robinson (43-5) both beat Ray Benard (43-2), so they now rank 2nd and 3rd and Benard 4th.
- **Boys shot put**: Jason Gaffney (48-10) was listed 4th but is now 2nd.
- **Girls 1000m**: Shannon Smith (3:02.75) now ranks ahead of Angela Ryck (3:02.92).
- **Boys DMR**: 11:44.06 (2002) now ranks ahead of 11:53.95 (2007).
- **Boys 1600m**: Pat DuPont (4:27.73) and Dave Yendrzeski (4:27.74) were both listed 9th; they are now 9th and 10th.
- **Ties**: equal marks now share a place everywhere (e.g., girls 55m Biehler and George are both T1, and girls long jump Keenan and Shin are both T7). Several of these were numbered differently on the original lists.

## Probable typos (left as entered)
- **MaKayla George** was spelled "Makayla" in the 300m list; it's now "MaKayla" in both.

## Fixed
- **Boys 4x400 #10** (Bowen, Corwin, Hickey, Newburge) and **boys 4x800 #2** (Leombrone, Hain, Hickey, Green) were corrected to 2026.
- Rachel Koonmen's weight throw (1984), Lauren Burke's 600m (2011) and Kim Trawitz's 600m (2002) are confirmed correct.
- **Ray Bernard**: the triple jump entry was spelled "Benard"; it now reads "Bernard" to match his long jump and 600m.

## Missing or changed entries
- **Girls DMR** has no marks, so the page shows "No mark on file."
- **Boys 4x800**: "Rochester Relays 8:11.18 (2015)" appeared twice. It's kept once.
- **Boys DMR #8** (Leombrone, Newburge, Pacer, Green) had no time, so it was left out.
- **Unnamed entries**: boys TJ 41-4 (2006), boys 4x200 1:34.84 (2005), boys SMR 3:37.33 (1998) and 3:58.46 (2007), boys DMR (2002, 2007), girls 4x800 9:47.00 (2002), girls SMR 4:42.01 (2013). These show "Name not on file."
- **Relays listed by meet name** (State Quals, Sectionals, RIT, etc.) are stored in the `meet` column and show as "Relay at State Quals." Add the legs to `athletes` whenever you find them.
- **Girls 1500m**: Ari Reback's 4:45.25 had an asterisk. It's kept as a note under her name; edit the note to say what it means.
- **11th-place rows** (girls 55m Edmunds 7.62, girls 4x200 Myers/Fish/Sargeant/Atkins-Lewis) are kept in the file but don't display, since they're outside the top 10.

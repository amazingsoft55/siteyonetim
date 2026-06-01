-- Taleplere çözüm/red notu ve görseli ekle
ALTER TABLE `requests` ADD COLUMN `resolution_note` text;
ALTER TABLE `requests` ADD COLUMN `resolution_image_url` text;
ALTER TABLE `requests` ADD COLUMN `rejected_note` text;
ALTER TABLE `requests` ADD COLUMN `rejected_image_url` text;
